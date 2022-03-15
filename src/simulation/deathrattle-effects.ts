/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { AURA_ORIGINS, CardsData } from '../cards/cards-data';
import { groupByFunction, pickMultipleRandomDifferent, pickRandom } from '../services/utils';
import {
	addStatsToBoard,
	afterStatsUpdate,
	grantAllDivineShield,
	grantRandomAttack,
	grantRandomDivineShield,
	grantRandomHealth,
	grantRandomStats,
	hasCorrectTribe,
	isCorrectTribe,
	modifyAttack,
	modifyHealth,
} from '../utils';
import { bumpEntities, dealDamageToEnemy, dealDamageToRandomEnemy, getNeighbours } from './attack';
import { removeAurasAfterAuraSourceDeath } from './auras';
import { spawnEntities } from './deathrattle-spawns';
import { SharedState } from './shared-state';
import { Spectator } from './spectator/spectator';

export const handleDeathrattleEffects = (
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	deadEntity: BoardEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	const rivendare = boardWithDeadEntity.find((entity) => entity.cardId === CardIds.BaronRivendare2);
	const goldenRivendare = boardWithDeadEntity.find((entity) => entity.cardId === CardIds.BaronRivendareBattlegrounds);
	const multiplier = goldenRivendare ? 3 : rivendare ? 2 : 1;
	// We do it on a case by case basis so that we deal all the damage in one go for instance
	// and avoid proccing deathrattle spawns between the times the damage triggers
	switch (deadEntity.cardId) {
		case CardIds.SelflessHero:
			for (let i = 0; i < multiplier; i++) {
				grantRandomDivineShield(deadEntity, boardWithDeadEntity, spectator);
			}
			break;
		case CardIds.SelflessHeroBattlegrounds:
			for (let i = 0; i < multiplier; i++) {
				grantRandomDivineShield(deadEntity, boardWithDeadEntity, spectator);
				grantRandomDivineShield(deadEntity, boardWithDeadEntity, spectator);
			}
			break;
		case CardIds.SpiritOfAirBattlegrounds1:
			for (let i = 0; i < multiplier; i++) {
				const target = pickRandom(boardWithDeadEntity);
				if (target) {
					target.divineShield = true;
					target.taunt = true;
					target.windfury = true;
					spectator.registerPowerTarget(deadEntity, target, boardWithDeadEntity);
				}
			}
			break;
		case CardIds.SpiritOfAirBattlegrounds2:
			for (let i = 0; i < multiplier; i++) {
				const target = pickRandom(boardWithDeadEntity);
				if (target) {
					target.divineShield = true;
					target.taunt = true;
					target.windfury = true;
					spectator.registerPowerTarget(deadEntity, target, boardWithDeadEntity);

					const target2 = pickRandom(boardWithDeadEntity.filter((e) => e.entityId !== target.entityId));
					if (target2) {
						target2.divineShield = true;
						target2.taunt = true;
						target2.windfury = true;
						spectator.registerPowerTarget(deadEntity, target, boardWithDeadEntity);
					}
				}
			}
			break;
		case CardIds.NadinaTheRed:
		case CardIds.NadinaTheRedBattlegrounds:
			for (let i = 0; i < multiplier; i++) {
				grantAllDivineShield(boardWithDeadEntity, 'DRAGON', allCards);
			}
			break;
		case CardIds.SpawnOfNzoth:
			addStatsToBoard(deadEntity, boardWithDeadEntity, multiplier * 1, multiplier * 1, allCards, spectator);
			break;
		case CardIds.SpawnOfNzothBattlegrounds:
			addStatsToBoard(deadEntity, boardWithDeadEntity, multiplier * 2, multiplier * 2, allCards, spectator);
			break;
		case CardIds.GoldrinnTheGreatWolf:
			addStatsToBoard(deadEntity, boardWithDeadEntity, multiplier * 5, multiplier * 5, allCards, spectator, 'BEAST');
			break;
		case CardIds.GoldrinnTheGreatWolfBattlegrounds:
			addStatsToBoard(deadEntity, boardWithDeadEntity, multiplier * 10, multiplier * 10, allCards, spectator, 'BEAST');
			break;
		case CardIds.KingBagurgle:
			addStatsToBoard(deadEntity, boardWithDeadEntity, multiplier * 2, multiplier * 2, allCards, spectator, 'MURLOC');
			break;
		case CardIds.KingBagurgleBattlegrounds:
			addStatsToBoard(deadEntity, boardWithDeadEntity, multiplier * 4, multiplier * 4, allCards, spectator, 'MURLOC');
			break;
		case CardIds.FiendishServant:
			for (let i = 0; i < multiplier; i++) {
				grantRandomAttack(deadEntity, boardWithDeadEntity, deadEntity.attack, allCards, spectator);
			}
			break;
		case CardIds.FiendishServantBattlegrounds:
			for (let i = 0; i < multiplier; i++) {
				grantRandomAttack(deadEntity, boardWithDeadEntity, deadEntity.attack, allCards, spectator);
				grantRandomAttack(deadEntity, boardWithDeadEntity, deadEntity.attack, allCards, spectator);
			}
			break;
		case CardIds.ImpulsiveTrickster:
			for (let i = 0; i < multiplier; i++) {
				grantRandomHealth(deadEntity, boardWithDeadEntity, deadEntity.maxHealth, allCards, spectator, true);
			}
			break;
		case CardIds.ImpulsiveTricksterBattlegrounds:
			for (let i = 0; i < multiplier; i++) {
				grantRandomHealth(deadEntity, boardWithDeadEntity, deadEntity.maxHealth, allCards, spectator, true);
				grantRandomHealth(deadEntity, boardWithDeadEntity, deadEntity.maxHealth, allCards, spectator, true);
			}
			break;
		case CardIds.Leapfrogger:
			for (let i = 0; i < multiplier; i++) {
				applyLeapFroggerEffect(boardWithDeadEntity, deadEntity, false, allCards, spectator);
			}
			break;
		case CardIds.LeapfroggerBattlegrounds:
			for (let i = 0; i < multiplier; i++) {
				applyLeapFroggerEffect(boardWithDeadEntity, deadEntity, true, allCards, spectator);
			}
			break;
		case CardIds.PalescaleCrocolisk:
			for (let i = 0; i < multiplier; i++) {
				const target = grantRandomStats(deadEntity, boardWithDeadEntity, 6, 6, Race.BEAST, allCards, spectator);
				if (!!target) {
					spectator.registerPowerTarget(deadEntity, target, boardWithDeadEntity);
				}
			}
			break;
		case CardIds.PalescaleCrocoliskBattlegrounds:
			for (let i = 0; i < multiplier; i++) {
				const target = grantRandomStats(deadEntity, boardWithDeadEntity, 12, 12, Race.BEAST, allCards, spectator);
				if (!!target) {
					spectator.registerPowerTarget(deadEntity, target, boardWithDeadEntity);
				}
			}
			break;
		case CardIds.LeapfroggerBattlegrounds:
			for (let i = 0; i < multiplier; i++) {
				applyLeapFroggerEffect(boardWithDeadEntity, deadEntity, true, allCards, spectator);
			}
			break;
		case CardIds.ElementiumSquirrelBombBattlegrounds1:
			// FIXME: I don't think this way of doing things is really accurate (as some deathrattles
			// could be spawned between the shots firing), but let's say it's good enough for now
			for (let i = 0; i < multiplier; i++) {
				const numberOfDeadMechsThisCombat = sharedState.deaths
					.filter((entity) => entity.friendly === deadEntity.friendly)
					// eslint-disable-next-line prettier/prettier
					.filter((entity) => isCorrectTribe(allCards.getCard(entity.cardId)?.race, Race.MECH)).length;
				for (let j = 0; j < numberOfDeadMechsThisCombat + 1; j++) {
					dealDamageToRandomEnemy(
						otherBoard,
						otherBoardHero,
						deadEntity,
						3,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						allCards,
						cardsData,
						sharedState,
						spectator,
					);
				}
			}
			break;
		case CardIds.ElementiumSquirrelBombBattlegrounds2:
			// FIXME: I don't think this way of doing things is really accurate (as some deathrattles
			// could be spawned between the shots firing), but let's say it's good enough for now
			for (let i = 0; i < multiplier; i++) {
				const numberOfDeadMechsThisCombat = sharedState.deaths
					.filter((entity) => entity.friendly === deadEntity.friendly)
					// eslint-disable-next-line prettier/prettier
					.filter((entity) => isCorrectTribe(allCards.getCard(entity.cardId)?.race, Race.MECH)).length;
				for (let j = 0; j < numberOfDeadMechsThisCombat + 1; j++) {
					dealDamageToRandomEnemy(
						otherBoard,
						otherBoardHero,
						deadEntity,
						6,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						allCards,
						cardsData,
						sharedState,
						spectator,
					);
				}
			}
			break;
		case CardIds.KaboomBot:
			// FIXME: I don't think this way of doing things is really accurate (as some deathrattles
			// could be spawned between the shots firing), but let's say it's good enough for now
			for (let i = 0; i < multiplier; i++) {
				dealDamageToRandomEnemy(
					otherBoard,
					otherBoardHero,
					deadEntity,
					4,
					boardWithDeadEntity,
					boardWithDeadEntityHero,
					allCards,
					cardsData,
					sharedState,
					spectator,
				);
			}
			break;
		case CardIds.KaboomBotBattlegrounds:
			for (let i = 0; i < multiplier; i++) {
				dealDamageToRandomEnemy(
					otherBoard,
					otherBoardHero,
					deadEntity,
					4,
					boardWithDeadEntity,
					boardWithDeadEntityHero,
					allCards,
					cardsData,
					sharedState,
					spectator,
				);
				dealDamageToRandomEnemy(
					otherBoard,
					otherBoardHero,
					deadEntity,
					4,
					boardWithDeadEntity,
					boardWithDeadEntityHero,
					allCards,
					cardsData,
					sharedState,
					spectator,
				);
			}
			break;

		case CardIds.SrTombDiverBattlegrounds1:
			for (let i = 0; i < Math.min(1, boardWithDeadEntity.length); i++) {
				const rightMostMinion = boardWithDeadEntity[boardWithDeadEntity.length - 1 - i];
				if (rightMostMinion) {
					const refCard = allCards.getCard(rightMostMinion.cardId);
					const goldenCard = allCards.getCardFromDbfId(refCard.battlegroundsPremiumDbfId);
					rightMostMinion.cardId = goldenCard.id;
					modifyAttack(rightMostMinion, refCard.attack, boardWithDeadEntity, allCards);
					modifyHealth(rightMostMinion, refCard.health, boardWithDeadEntity, allCards);
					afterStatsUpdate(rightMostMinion, boardWithDeadEntity, allCards);
					spectator.registerPowerTarget(deadEntity, rightMostMinion, boardWithDeadEntity);
				}
			}
			break;
		case CardIds.SrTombDiverBattlegrounds2:
			for (let i = 0; i < Math.min(2, boardWithDeadEntity.length); i++) {
				const rightMostMinion = boardWithDeadEntity[boardWithDeadEntity.length - 1 - i];
				if (rightMostMinion) {
					const refCard = allCards.getCard(rightMostMinion.cardId);
					const goldenCard = allCards.getCardFromDbfId(refCard.battlegroundsPremiumDbfId);
					rightMostMinion.cardId = goldenCard.id;
					modifyAttack(rightMostMinion, refCard.attack, boardWithDeadEntity, allCards);
					modifyHealth(rightMostMinion, refCard.health, boardWithDeadEntity, allCards);
					afterStatsUpdate(rightMostMinion, boardWithDeadEntity, allCards);
					spectator.registerPowerTarget(deadEntity, rightMostMinion, boardWithDeadEntity);
				}
			}
			break;
	}

	// It's important to first copy the enchantments, otherwise you could end up
	// in an infinite loop - since new enchants are added after each step
	let enchantments: { cardId: string; originEntityId?: number; repeats?: number }[] = [...(deadEntity.enchantments ?? [])];
	const threshold = 20;
	if (enchantments.length > threshold || enchantments.some((e) => e.repeats && e.repeats > 1)) {
		// console.warn(
		// 	'too many enchtments, truncating',
		// 	stringifySimpleCard(deadEntity),
		// 	deadEntity.enchantments.length,
		// 	deadEntity.enchantments,
		// );
		// In some cases it's possible that there are way too many enchantments because of the frog
		// In that case, we make a trade-off and don't trigger the "on stats change" trigger as
		// often as we should, so that we can have the stats themselves correct
		const enchantmentGroups = groupByFunction((enchantment: any) => enchantment.cardId)(enchantments);
		enchantments = Object.keys(enchantmentGroups).map((cardId) => ({
			cardId: cardId,
			repeats: enchantmentGroups[cardId].length,
		}));
	}
	for (const enchantment of enchantments) {
		switch (enchantment.cardId) {
			case CardIds.Leapfrogger_LeapfrogginEnchantment1:
				if (!!enchantment.repeats && enchantment.repeats > 1) {
					applyLeapFroggerEffect(boardWithDeadEntity, deadEntity, false, allCards, spectator, multiplier * enchantment.repeats);
				} else {
					for (let i = 0; i < multiplier; i++) {
						applyLeapFroggerEffect(boardWithDeadEntity, deadEntity, false, allCards, spectator);
					}
				}
				break;
			case CardIds.Leapfrogger_LeapfrogginEnchantment2:
				if (!!enchantment.repeats && enchantment.repeats > 1) {
					applyLeapFroggerEffect(boardWithDeadEntity, deadEntity, true, allCards, spectator, multiplier * enchantment.repeats);
				} else {
					for (let i = 0; i < multiplier; i++) {
						applyLeapFroggerEffect(boardWithDeadEntity, deadEntity, true, allCards, spectator);
					}
				}
				break;
			case CardIds.EarthRecollectionEnchantment:
				for (let i = 0; i < multiplier; i++) {
					applyEarthInvocationEnchantment(boardWithDeadEntity, deadEntity, allCards, spectator);
				}
				break;
			case CardIds.FireRecollectionEnchantment:
				for (let i = 0; i < multiplier; i++) {
					applyFireInvocationEnchantment(boardWithDeadEntity, deadEntity, allCards, spectator);
				}
				break;
			case CardIds.WaterRecollectionEnchantment:
				for (let i = 0; i < multiplier; i++) {
					applyWaterInvocationEnchantment(boardWithDeadEntity, deadEntity, allCards, spectator);
				}
				break;
			case CardIds.LightningRecollectionEnchantment:
				for (let i = 0; i < multiplier; i++) {
					applyLightningInvocationEnchantment(
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						deadEntity,
						otherBoard,
						otherBoardHero,
						allCards,
						cardsData,
						sharedState,
						spectator,
					);
				}
				break;
		}
	}
};

export const applyLightningInvocationEnchantment = (
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	deadEntity: BoardEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	// Because the golden version doubles all the remembered effects
	const multiplier = deadEntity?.cardId === CardIds.SpiritRaptorBattlegrounds ? 2 : 1;
	for (let i = 0; i < multiplier; i++) {
		const targets = pickMultipleRandomDifferent(otherBoard, 5);
		for (const target of targets) {
			dealDamageToEnemy(
				target,
				otherBoard,
				otherBoardHero,
				deadEntity,
				1,
				boardWithDeadEntity,
				boardWithDeadEntityHero,
				allCards,
				cardsData,
				sharedState,
				spectator,
			);
		}
	}
};

export const applyWaterInvocationEnchantment = (
	boardWithDeadEntity: BoardEntity[],
	deadEntity: BoardEntity,
	allCards: AllCardsService,
	spectator: Spectator,
): void => {
	const multiplier = deadEntity?.cardId === CardIds.SpiritRaptorBattlegrounds ? 2 : 1;
	for (let i = 0; i < multiplier; i++) {
		const target: BoardEntity = boardWithDeadEntity[boardWithDeadEntity.length - 1];
		if (!!target) {
			modifyHealth(target, 3, boardWithDeadEntity, allCards);
			target.taunt = true;
			afterStatsUpdate(target, boardWithDeadEntity, allCards);
		}
	}
};

export const applyFireInvocationEnchantment = (
	boardWithDeadEntity: BoardEntity[],
	deadEntity: BoardEntity,
	allCards: AllCardsService,
	spectator: Spectator,
): void => {
	const multiplier = deadEntity?.cardId === CardIds.SpiritRaptorBattlegrounds ? 2 : 1;
	for (let i = 0; i < multiplier; i++) {
		const target: BoardEntity = boardWithDeadEntity[0];
		if (!!target) {
			modifyAttack(target, target.attack, boardWithDeadEntity, allCards);
			afterStatsUpdate(target, boardWithDeadEntity, allCards);
		}
	}
};

export const applyEarthInvocationEnchantment = (
	boardWithDeadEntity: BoardEntity[],
	deadEntity: BoardEntity,
	allCards: AllCardsService,
	spectator: Spectator,
): void => {
	const multiplier = deadEntity?.cardId === CardIds.SpiritRaptorBattlegrounds ? 2 : 1;
	for (let i = 0; i < multiplier; i++) {
		const minionsGrantedDeathrattle: BoardEntity[] = pickMultipleRandomDifferent(boardWithDeadEntity, 4);
		minionsGrantedDeathrattle.forEach((minion) => {
			minion.enchantments.push({
				cardId: CardIds.EarthInvocation_ElementEarthEnchantment,
				originEntityId: deadEntity?.entityId,
			});
		});
	}
};

const applyLeapFroggerEffect = (
	boardWithDeadEntity: BoardEntity[],
	deadEntity: BoardEntity,
	isPremium: boolean,
	allCards: AllCardsService,
	spectator: Spectator,
	multiplier = 1,
): void => {
	multiplier = multiplier || 1;
	const buffed = grantRandomStats(
		deadEntity,
		boardWithDeadEntity,
		multiplier * (isPremium ? 2 : 1),
		multiplier * (isPremium ? 2 : 1),
		Race.BEAST,
		allCards,
		spectator,
	);
	if (buffed) {
		buffed.enchantments = buffed.enchantments ?? [];
		buffed.enchantments.push({
			cardId: isPremium ? CardIds.Leapfrogger_LeapfrogginEnchantment2 : CardIds.Leapfrogger_LeapfrogginEnchantment1,
			originEntityId: deadEntity.entityId,
			repeats: multiplier > 1 ? multiplier : undefined,
		});
		// Don't register power effect here, since it's already done in the random stats
		// spectator.registerPowerTarget(deadEntity, buffed, boardWithDeadEntity);
		// console.log('applyLeapFroggerEffect', stringifySimpleCard(deadEntity), stringifySimpleCard(buffed));
	}
};

export const applyMinionDeathEffect = (
	deadEntity: BoardEntity,
	deadEntityIndex: number,
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	// console.log('applying minion death effect', stringifySimpleCard(deadEntity, allCards));
	if (isCorrectTribe(allCards.getCard(deadEntity.cardId).race, Race.BEAST)) {
		applyScavengingHyenaEffect(boardWithDeadEntity, allCards, spectator);
	}
	if (isCorrectTribe(allCards.getCard(deadEntity.cardId).race, Race.DEMON)) {
		applySoulJugglerEffect(
			boardWithDeadEntity,
			boardWithDeadEntityHero,
			otherBoard,
			otherBoardHero,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
	}
	if (isCorrectTribe(allCards.getCard(deadEntity.cardId).race, Race.MECH)) {
		applyJunkbotEffect(boardWithDeadEntity, allCards, spectator);
	}
	if (hasCorrectTribe(deadEntity, Race.MURLOC, allCards)) {
		removeOldMurkEyeAttack(boardWithDeadEntity, allCards);
		removeOldMurkEyeAttack(otherBoard, allCards);
	}

	if (AURA_ORIGINS.includes(deadEntity.cardId)) {
		removeAurasAfterAuraSourceDeath(boardWithDeadEntity, deadEntity, cardsData);
	}

	if (deadEntity.taunt) {
		// applyQirajiHarbringerEffect(boardWithDeadEntity, deadEntityIndex, allCards);
	}
	// Overkill
	if (deadEntity.health < 0 && deadEntity.lastAffectedByEntity?.attacking) {
		if (deadEntity.lastAffectedByEntity.cardId === CardIds.HeraldOfFlame2) {
			const targets = boardWithDeadEntity.filter((entity) => entity.health > 0 && !entity.definitelyDead);
			if (targets.length > 0) {
				const target = targets[0];
				dealDamageToEnemy(
					target,
					boardWithDeadEntity,
					boardWithDeadEntityHero,
					deadEntity.lastAffectedByEntity,
					3,
					otherBoard,
					otherBoardHero,
					allCards,
					cardsData,
					sharedState,
					spectator,
				);
			}
		} else if (deadEntity.lastAffectedByEntity.cardId === CardIds.HeraldOfFlameBattlegrounds) {
			const targets = boardWithDeadEntity.filter((entity) => entity.health > 0 && !entity.definitelyDead);
			if (targets.length > 0) {
				const target = targets[0];
				dealDamageToEnemy(
					target,
					boardWithDeadEntity,
					boardWithDeadEntityHero,
					deadEntity.lastAffectedByEntity,
					6,
					otherBoard,
					otherBoardHero,
					allCards,
					cardsData,
					sharedState,
					spectator,
				);
			}
		} else if (deadEntity.lastAffectedByEntity.cardId === CardIds.WildfireElemental) {
			// console.log('applying WildfireElemental effect', stringifySimple(boardWithDeadEntity, allCards));
			const excessDamage = -deadEntity.health;
			const neighbours = getNeighbours(boardWithDeadEntity, null, deadEntityIndex);
			// console.log('neighbours', stringifySimple(neighbours, allCards));
			if (neighbours.length > 0) {
				const randomTarget = neighbours[Math.floor(Math.random() * neighbours.length)];
				dealDamageToEnemy(
					randomTarget,
					boardWithDeadEntity,
					boardWithDeadEntityHero,
					null,
					excessDamage,
					otherBoard,
					otherBoardHero,
					allCards,
					cardsData,
					sharedState,
					spectator,
				);
			}
		} else if (deadEntity.lastAffectedByEntity.cardId === CardIds.WildfireElementalBattlegrounds) {
			const excessDamage = -deadEntity.health;
			const neighbours = getNeighbours(boardWithDeadEntity, null, deadEntityIndex);
			neighbours.forEach((neighbour) =>
				dealDamageToEnemy(
					neighbour,
					boardWithDeadEntity,
					boardWithDeadEntityHero,
					null,
					excessDamage,
					otherBoard,
					otherBoardHero,
					allCards,
					cardsData,
					sharedState,
					spectator,
				),
			);
		} else if (deadEntity.lastAffectedByEntity.cardId === CardIds.IronhideDirehorn) {
			const newEntities = spawnEntities(
				CardIds.IronhideDirehorn_IronhideRuntToken,
				1,
				otherBoard,
				otherBoardHero,
				boardWithDeadEntity,
				boardWithDeadEntityHero,
				allCards,
				cardsData,
				sharedState,
				spectator,
				!deadEntity.friendly,
				true,
			);
			otherBoard.splice(deadEntityIndex, 0, ...newEntities);
		} else if (deadEntity.lastAffectedByEntity.cardId === CardIds.IronhideDirehornBattlegrounds) {
			const newEntities = spawnEntities(
				CardIds.IronhideDirehorn_IronhideRuntTokenBattlegrounds,
				1,
				otherBoard,
				otherBoardHero,
				boardWithDeadEntity,
				boardWithDeadEntityHero,
				allCards,
				cardsData,
				sharedState,
				spectator,
				!deadEntity.friendly,
				true,
			);
			otherBoard.splice(deadEntityIndex, 0, ...newEntities);
		} else if (deadEntity.lastAffectedByEntity.cardId === CardIds.SeabreakerGoliath2) {
			const otherPirates = otherBoard
				.filter((entity) => isCorrectTribe(allCards.getCard(entity.cardId).race, Race.PIRATE))
				.filter((entity) => entity.entityId !== deadEntity.lastAffectedByEntity.entityId);
			otherPirates.forEach((pirate) => {
				modifyAttack(pirate, 2, boardWithDeadEntity, allCards);
				modifyHealth(pirate, 2, boardWithDeadEntity, allCards);
				afterStatsUpdate(pirate, boardWithDeadEntity, allCards);
				spectator.registerPowerTarget(deadEntity.lastAffectedByEntity, pirate, otherBoard);
			});
		} else if (deadEntity.lastAffectedByEntity.cardId === CardIds.SeabreakerGoliathBattlegrounds) {
			const otherPirates = otherBoard
				.filter((entity) => isCorrectTribe(allCards.getCard(entity.cardId).race, Race.PIRATE))
				.filter((entity) => entity.entityId !== deadEntity.lastAffectedByEntity.entityId);
			otherPirates.forEach((pirate) => {
				modifyAttack(pirate, 4, boardWithDeadEntity, allCards);
				modifyHealth(pirate, 4, boardWithDeadEntity, allCards);
				afterStatsUpdate(pirate, boardWithDeadEntity, allCards);
				spectator.registerPowerTarget(deadEntity.lastAffectedByEntity, pirate, otherBoard);
			});
		}
		// else if (deadEntity.lastAffectedByEntity.cardId === CardIds.NatPagleExtremeAngler) {
		// }
	}

	const rivendare = boardWithDeadEntity.find((entity) => entity.cardId === CardIds.BaronRivendare2);
	const goldenRivendare = boardWithDeadEntity.find((entity) => entity.cardId === CardIds.BaronRivendareBattlegrounds);
	const multiplier = goldenRivendare ? 3 : rivendare ? 2 : 1;
	if (deadEntity.cardId === CardIds.UnstableGhoul) {
		for (let i = 0; i < multiplier; i++) {
			dealDamageToAllMinions(
				boardWithDeadEntity,
				boardWithDeadEntityHero,
				otherBoard,
				otherBoardHero,
				deadEntity,
				1,
				allCards,
				cardsData,
				sharedState,
				spectator,
			);
		}
	} else if (deadEntity.cardId === CardIds.UnstableGhoulBattlegrounds) {
		for (let i = 0; i < multiplier; i++) {
			dealDamageToAllMinions(
				boardWithDeadEntity,
				boardWithDeadEntityHero,
				otherBoard,
				otherBoardHero,
				deadEntity,
				2,
				allCards,
				cardsData,
				sharedState,
				spectator,
			);
		}
	}

	// applyAvengeEffects(
	// 	deadEntity,
	// 	deadEntityIndex,
	// 	boardWithDeadEntity,
	// 	boardWithDeadEntityHero,
	// 	otherBoard,
	// 	otherBoardHero,
	// 	allCards,
	// 	cardsData,
	// 	sharedState,
	// 	spectator,
	// );
};

export const dealDamageToAllMinions = (
	board1: BoardEntity[],
	board1Hero: BgsPlayerEntity,
	board2: BoardEntity[],
	board2Hero: BgsPlayerEntity,
	damageSource: BoardEntity,
	damageDealt: number,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	if (board1.length === 0 && board2.length === 0) {
		return;
		// return [board1, board2];
	}
	// let updatedBoard1 = [...board1];
	// let updatedBoard2 = [...board2];
	const fakeAttacker = {
		...(damageSource || {}),
		entityId: -1,
		attack: damageDealt,
		attacking: true,
	} as BoardEntity;
	for (let i = 0; i < board1.length; i++) {
		bumpEntities(board1[i], fakeAttacker, board1, board1Hero, board2, board2Hero, allCards, cardsData, sharedState, spectator);
		// board1[i] = entity;
	}
	for (let i = 0; i < board2.length; i++) {
		bumpEntities(board2[i], fakeAttacker, board2, board2Hero, board1, board1Hero, allCards, cardsData, sharedState, spectator);
		// updatedBoard2 = [...boardResult];
		// updatedBoard2[i] = entity;
	}
	// processMinionDeath(board1, board1Hero, board2, board2Hero, allCards, cardsData, sharedState, spectator);
};

const applySoulJugglerEffect = (
	boardWithJugglers: BoardEntity[],
	boardWithJugglersHero: BgsPlayerEntity,
	boardToAttack: BoardEntity[],
	boardToAttackHero: BgsPlayerEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	if (boardWithJugglers.length === 0 && boardToAttack.length === 0) {
		return;
		// return [boardWithJugglers, boardToAttack];
	}
	const jugglers = boardWithJugglers.filter((entity) => entity.cardId === CardIds.SoulJuggler);
	for (const juggler of jugglers) {
		dealDamageToRandomEnemy(
			boardToAttack,
			boardToAttackHero,
			juggler,
			3,
			boardWithJugglers,
			boardWithJugglersHero,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
	}
	const goldenJugglers = boardWithJugglers.filter((entity) => entity.cardId === CardIds.SoulJugglerBattlegrounds);
	for (const juggler of goldenJugglers) {
		dealDamageToRandomEnemy(
			boardToAttack,
			boardToAttackHero,
			juggler,
			3,
			boardWithJugglers,
			boardWithJugglersHero,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
		dealDamageToRandomEnemy(
			boardToAttack,
			boardToAttackHero,
			juggler,
			3,
			boardWithJugglers,
			boardWithJugglersHero,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
	}
	// processMinionDeath(
	// 	boardWithJugglers,
	// 	boardWithJugglersHero,
	// 	boardToAttack,
	// 	boardToAttackHero,
	// 	allCards,
	// 	cardsData,
	// 	sharedState,
	// 	spectator,
	// );
};

const applyScavengingHyenaEffect = (board: BoardEntity[], allCards: AllCardsService, spectator: Spectator): void => {
	// const copy = [...board];
	for (let i = 0; i < board.length; i++) {
		if (board[i].cardId === CardIds.ScavengingHyenaLegacy) {
			modifyAttack(board[i], 2, board, allCards);
			modifyHealth(board[i], 1, board, allCards);
			afterStatsUpdate(board[i], board, allCards);
			spectator.registerPowerTarget(board[i], board[i], board);
		} else if (board[i].cardId === CardIds.ScavengingHyenaBattlegrounds) {
			modifyAttack(board[i], 4, board, allCards);
			modifyHealth(board[i], 2, board, allCards);
			afterStatsUpdate(board[i], board, allCards);
			spectator.registerPowerTarget(board[i], board[i], board);
		}
	}
};

const applyJunkbotEffect = (board: BoardEntity[], allCards: AllCardsService, spectator: Spectator): void => {
	for (let i = 0; i < board.length; i++) {
		if (board[i].cardId === CardIds.Junkbot) {
			modifyAttack(board[i], 2, board, allCards);
			modifyHealth(board[i], 2, board, allCards);
			afterStatsUpdate(board[i], board, allCards);
			spectator.registerPowerTarget(board[i], board[i], board);
		} else if (board[i].cardId === CardIds.JunkbotBattlegrounds) {
			modifyAttack(board[i], 4, board, allCards);
			modifyHealth(board[i], 4, board, allCards);
			afterStatsUpdate(board[i], board, allCards);
			spectator.registerPowerTarget(board[i], board[i], board);
		}
	}
};

// const applyQirajiHarbringerEffect = (board: BoardEntity[], deadEntityIndex: number, allCards: AllCardsService): void => {
// 	const qiraji = board.filter((entity) => entity.cardId === CardIds.QirajiHarbinger);
// 	const goldenQiraji = board.filter((entity) => entity.cardId === CardIds.QirajiHarbingerBattlegrounds);
// 	const neighbours = getNeighbours(board, null, deadEntityIndex);

// 	// TODO: if reactivated, properly apply buffs one by one, instead of all together

// 	neighbours.forEach((entity) => {
// 		modifyAttack(entity, 2 * qiraji.length + 4 * goldenQiraji.length, board, allCards);
// 		modifyHealth(entity, 2 * qiraji.length + 4 * goldenQiraji.length);
// 		afterStatsUpdate(entity, board, allCards);
// 	});
// };

export const applyMonstrosity = (
	monstrosity: BoardEntity,
	deadEntities: readonly BoardEntity[],
	boardWithDeadEntities: BoardEntity[],
	allCards: AllCardsService,
): void => {
	for (const deadEntity of deadEntities) {
		modifyAttack(monstrosity, deadEntity.attack, boardWithDeadEntities, allCards);
		if (monstrosity.cardId === CardIds.MonstrosityBattlegrounds) {
			modifyAttack(monstrosity, deadEntity.attack, boardWithDeadEntities, allCards);
		}
	}
};

export const rememberDeathrattles = (fish: BoardEntity, deadEntities: readonly BoardEntity[], cardsData: CardsData): void => {
	const validDeathrattles = deadEntities
		.filter((entity) => cardsData.validDeathrattles.includes(entity.cardId))
		.map((entity) => entity.cardId);
	const validEnchantments = deadEntities
		.filter((entity) => entity.enchantments?.length)
		.map((entity) => entity.enchantments)
		.reduce((a, b) => a.concat(b), [])
		.map((enchantment) => enchantment.cardId)
		.filter((enchantmentId) =>
			[
				CardIds.ReplicatingMenace_ReplicatingMenaceEnchantment,
				CardIds.ReplicatingMenace_ReplicatingMenaceEnchantmentBattlegrounds,
				CardIds.LivingSpores_LivingSporesEnchantment,
				CardIds.SneedsReplicator_ReplicateEnchantment,
				CardIds.EarthInvocation_ElementEarthEnchantment,
				CardIds.FireInvocation_ElementFireEnchantment,
				CardIds.WaterInvocation_ElementWaterEnchantment,
				CardIds.LightningInvocation,
			].includes(enchantmentId as CardIds),
		);
	const newDeathrattles = [...validDeathrattles, ...validEnchantments];
	// Order is important
	if (fish.cardId === CardIds.FishOfNzothBattlegrounds) {
		// https://stackoverflow.com/questions/33305152/how-to-duplicate-elements-in-a-js-array
		const doubleDr = [...validDeathrattles, ...validEnchantments].reduce((res, current) => res.concat([current, current]), []);
		fish.rememberedDeathrattles = [...doubleDr, ...(fish.rememberedDeathrattles || [])];
	} else {
		fish.rememberedDeathrattles = [...newDeathrattles, ...(fish.rememberedDeathrattles || [])];
	}
};

const removeOldMurkEyeAttack = (boardWithDeadEntity: BoardEntity[], allCards: AllCardsService) => {
	const murkeyes = boardWithDeadEntity.filter(
		(entity) => entity.cardId === CardIds.OldMurkEyeLegacy || entity.cardId === CardIds.OldMurkEyeVanilla,
	);
	const goldenMurkeyes = boardWithDeadEntity.filter((entity) => entity.cardId === CardIds.OldMurkEyeBattlegrounds);
	murkeyes.forEach((entity) => {
		modifyAttack(entity, -1, boardWithDeadEntity, allCards);
		afterStatsUpdate(entity, boardWithDeadEntity, allCards);
	});
	goldenMurkeyes.forEach((entity) => {
		modifyAttack(entity, -2, boardWithDeadEntity, allCards);
		afterStatsUpdate(entity, boardWithDeadEntity, allCards);
	});
};
