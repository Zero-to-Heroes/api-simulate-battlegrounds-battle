/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';
import { groupByFunction } from '../services/utils';
import { afterStatsUpdate, getRaceEnum, hasCorrectTribe, isCorrectTribe, modifyAttack, modifyHealth } from '../utils';
import { bumpEntities, dealDamageToEnemy, dealDamageToRandomEnemy, getNeighbours } from './attack';
import { spawnEntities } from './deathrattle-spawns';
import { SharedState } from './shared-state';
import { Spectator } from './spectator/spectator';

export const handleDeathrattleEffects = (
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	deadEntity: BoardEntity,
	deadMinionIndex: number,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	// console.log('handleDeathrattleEffects', stringifySimpleCard(deadEntity, allCards));
	if (deadMinionIndex >= 0) {
		applyMinionDeathEffect(
			deadEntity,
			deadMinionIndex,
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

	const rivendare = boardWithDeadEntity.find((entity) => entity.cardId === CardIds.Collectible.Neutral.BaronRivendare2);
	const goldenRivendare = boardWithDeadEntity.find(
		(entity) => entity.cardId === CardIds.NonCollectible.Neutral.BaronRivendareBattlegrounds,
	);
	const multiplier = goldenRivendare ? 3 : rivendare ? 2 : 1;
	// We do it on a case by case basis so that we deal all the damage in one go for instance
	// and avoid proccing deathrattle spawns between the times the damage triggers
	switch (deadEntity.cardId) {
		case CardIds.Collectible.Paladin.SelflessHero:
			for (let i = 0; i < multiplier; i++) {
				grantRandomDivineShield(deadEntity, boardWithDeadEntity, spectator);
			}
			break;
		case CardIds.NonCollectible.Paladin.SelflessHeroBattlegrounds:
			for (let i = 0; i < multiplier; i++) {
				grantRandomDivineShield(deadEntity, boardWithDeadEntity, spectator);
				grantRandomDivineShield(deadEntity, boardWithDeadEntity, spectator);
			}
			break;
		case CardIds.NonCollectible.Neutral.NadinaTheRed:
		case CardIds.NonCollectible.Neutral.NadinaTheRedBattlegrounds:
			for (let i = 0; i < multiplier; i++) {
				grantAllDivineShield(boardWithDeadEntity, 'DRAGON', allCards);
			}
			break;
		case CardIds.Collectible.Neutral.SpawnOfNzoth:
			addStatsToBoard(deadEntity, boardWithDeadEntity, multiplier * 1, multiplier * 1, allCards, spectator);
			break;
		case CardIds.NonCollectible.Neutral.SpawnOfNzothBattlegrounds:
			addStatsToBoard(deadEntity, boardWithDeadEntity, multiplier * 2, multiplier * 2, allCards, spectator);
			break;
		case CardIds.NonCollectible.Neutral.GoldrinnTheGreatWolf:
			addStatsToBoard(deadEntity, boardWithDeadEntity, multiplier * 5, multiplier * 5, allCards, spectator, 'BEAST');
			break;
		case CardIds.NonCollectible.Neutral.GoldrinnTheGreatWolfBattlegrounds:
			addStatsToBoard(deadEntity, boardWithDeadEntity, multiplier * 10, multiplier * 10, allCards, spectator, 'BEAST');
			break;
		case CardIds.NonCollectible.Neutral.KingBagurgle:
			addStatsToBoard(deadEntity, boardWithDeadEntity, multiplier * 2, multiplier * 2, allCards, spectator, 'MURLOC');
			break;
		case CardIds.NonCollectible.Neutral.KingBagurgleBattlegrounds:
			addStatsToBoard(deadEntity, boardWithDeadEntity, multiplier * 4, multiplier * 4, allCards, spectator, 'MURLOC');
			break;
		case CardIds.Collectible.Warlock.FiendishServant:
			for (let i = 0; i < multiplier; i++) {
				grantRandomAttack(deadEntity, boardWithDeadEntity, deadEntity.attack, allCards, spectator);
			}
			break;
		case CardIds.NonCollectible.Warlock.FiendishServantBattlegrounds:
			for (let i = 0; i < multiplier; i++) {
				grantRandomAttack(deadEntity, boardWithDeadEntity, deadEntity.attack, allCards, spectator);
				grantRandomAttack(deadEntity, boardWithDeadEntity, deadEntity.attack, allCards, spectator);
			}
			break;
		case CardIds.NonCollectible.Neutral.ImpulsiveTrickster:
			for (let i = 0; i < multiplier; i++) {
				grantRandomHealth(deadEntity, boardWithDeadEntity, deadEntity.maxHealth, allCards, spectator);
			}
			break;
		case CardIds.NonCollectible.Neutral.ImpulsiveTricksterBattlegrounds:
			for (let i = 0; i < multiplier; i++) {
				grantRandomHealth(deadEntity, boardWithDeadEntity, deadEntity.maxHealth, allCards, spectator);
				grantRandomHealth(deadEntity, boardWithDeadEntity, deadEntity.maxHealth, allCards, spectator);
			}
			break;
		case CardIds.NonCollectible.Neutral.Leapfrogger:
			for (let i = 0; i < multiplier; i++) {
				applyLeapFroggerEffect(boardWithDeadEntity, deadEntity, false, allCards, spectator);
			}
			break;
		case CardIds.NonCollectible.Neutral.LeapfroggerBattlegrounds:
			for (let i = 0; i < multiplier; i++) {
				applyLeapFroggerEffect(boardWithDeadEntity, deadEntity, true, allCards, spectator);
			}
			break;
		case CardIds.NonCollectible.Neutral.PalescaleCrocolisk:
			for (let i = 0; i < multiplier; i++) {
				const target = grantRandomStats(deadEntity, boardWithDeadEntity, 6, 6, Race.BEAST, allCards, spectator);
				if (!!target) {
					spectator.registerPowerTarget(deadEntity, target, boardWithDeadEntity);
				}
			}
			break;
		case CardIds.NonCollectible.Neutral.PalescaleCrocoliskBattlegrounds:
			for (let i = 0; i < multiplier; i++) {
				const target = grantRandomStats(deadEntity, boardWithDeadEntity, 12, 12, Race.BEAST, allCards, spectator);
				if (!!target) {
					spectator.registerPowerTarget(deadEntity, target, boardWithDeadEntity);
				}
			}
			break;
		case CardIds.NonCollectible.Neutral.LeapfroggerBattlegrounds:
			for (let i = 0; i < multiplier; i++) {
				applyLeapFroggerEffect(boardWithDeadEntity, deadEntity, true, allCards, spectator);
			}
			break;
		case CardIds.Collectible.Neutral.KaboomBot:
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
		case CardIds.NonCollectible.Neutral.KaboomBotBattlegrounds:
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
	}

	// It's important to first copy the enchantments, otherwise you could end up
	// in an infinite loop - since new enchants are added after each step
	let enchantments: { cardId: string; originEntityId?: number; repeats?: number }[] = [...(deadEntity.enchantments ?? [])];
	const threshold = 20;
	if (enchantments.length > threshold || enchantments.some((e) => e.repeats && e.repeats > 1)) {
		// console.warn('too many enchtments, truncating');
		// In some cases it's possible that there are way too many enchantments because of the frog
		// In that case, we make a trade-off and don't trigger the "on stats change" trigger as
		// often as we should, so that we can have the stats themselves correct
		const enchantmentGroups = groupByFunction((enchantment) => enchantment.cardId)(enchantments);
		enchantments = Object.keys(enchantmentGroups).map((cardId) => ({
			cardId: cardId,
			repeats: enchantmentGroups[cardId].length,
		}));
	}
	for (const enchantment of enchantments) {
		switch (enchantment.cardId) {
			case CardIds.NonCollectible.Neutral.Leapfrogger_LeapfrogginEnchantment1:
				if (enchantment.repeats) {
					applyLeapFroggerEffect(boardWithDeadEntity, deadEntity, false, allCards, spectator, multiplier * enchantment.repeats);
				} else {
					for (let i = 0; i < multiplier; i++) {
						applyLeapFroggerEffect(boardWithDeadEntity, deadEntity, false, allCards, spectator);
					}
				}
				break;
			case CardIds.NonCollectible.Neutral.Leapfrogger_LeapfrogginEnchantment2:
				if (enchantment.repeats) {
					applyLeapFroggerEffect(boardWithDeadEntity, deadEntity, true, allCards, spectator, multiplier * enchantment.repeats);
				} else {
					for (let i = 0; i < multiplier; i++) {
						applyLeapFroggerEffect(boardWithDeadEntity, deadEntity, true, allCards, spectator);
					}
				}
				break;
		}
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
		multiplier * (isPremium ? 4 : 2),
		multiplier * (isPremium ? 4 : 2),
		Race.BEAST,
		allCards,
		spectator,
	);
	if (buffed) {
		buffed.enchantments = buffed.enchantments ?? [];
		buffed.enchantments.push({
			cardId: isPremium
				? CardIds.NonCollectible.Neutral.Leapfrogger_LeapfrogginEnchantment2
				: CardIds.NonCollectible.Neutral.Leapfrogger_LeapfrogginEnchantment1,
			originEntityId: deadEntity.entityId,
			repeats: multiplier,
		});
		// Don't register power effect here, since it's already done in the random stats
		// spectator.registerPowerTarget(deadEntity, buffed, boardWithDeadEntity);
		// console.log('applyLeapFroggerEffect', stringifySimpleCard(deadEntity), stringifySimpleCard(buffed));
	}
};

const getRandomMinion = (board: BoardEntity[], race: Race, allCards: AllCardsService): BoardEntity => {
	const validTribes = board.filter((e) => !race || isCorrectTribe(allCards.getCard(e.cardId).race, race));
	if (!validTribes.length) {
		return null;
	}
	return validTribes[Math.floor(Math.random() * validTribes.length)];
};

const getRandomMinionWithHighestHealth = (board: BoardEntity[]): BoardEntity => {
	if (!board.length) {
		return null;
	}

	const highestHealth = Math.max(...board.map((e) => e.health));
	const validMinions = board.filter((e) => e.health === highestHealth);
	return validMinions[Math.floor(Math.random() * validMinions.length)];
};

export const addStatsToBoard = (
	sourceEntity: BoardEntity,
	board: BoardEntity[],
	attack: number,
	health: number,
	allCards: AllCardsService,
	spectator: Spectator,
	tribe?: string,
): void => {
	for (const entity of board) {
		if (!tribe || isCorrectTribe(allCards.getCard(entity.cardId).race, Race[tribe])) {
			modifyAttack(entity, attack, board, allCards);
			modifyHealth(entity, health);
			afterStatsUpdate(entity, board, allCards);
			spectator.registerPowerTarget(sourceEntity, entity, board);
		}
	}
};

const applyMinionDeathEffect = (
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

	if (deadEntity.taunt) {
		// applyQirajiHarbringerEffect(boardWithDeadEntity, deadEntityIndex, allCards);
	}
	// Overkill
	if (deadEntity.health < 0 && deadEntity.lastAffectedByEntity?.attacking) {
		if (deadEntity.lastAffectedByEntity.cardId === CardIds.NonCollectible.Warrior.HeraldOfFlame2) {
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
		} else if (deadEntity.lastAffectedByEntity.cardId === CardIds.NonCollectible.Warrior.HeraldOfFlameBattlegrounds) {
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
		} else if (deadEntity.lastAffectedByEntity.cardId === CardIds.NonCollectible.Neutral.WildfireElemental) {
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
		} else if (deadEntity.lastAffectedByEntity.cardId === CardIds.NonCollectible.Neutral.WildfireElementalBattlegrounds) {
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
		} else if (deadEntity.lastAffectedByEntity.cardId === CardIds.Collectible.Druid.IronhideDirehorn) {
			const newEntities = spawnEntities(
				CardIds.NonCollectible.Druid.IronhideDirehorn_IronhideRuntToken,
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
		} else if (deadEntity.lastAffectedByEntity.cardId === CardIds.NonCollectible.Druid.IronhideDirehornBattlegrounds) {
			const newEntities = spawnEntities(
				CardIds.NonCollectible.Druid.IronhideDirehorn_IronhideRuntTokenBattlegrounds,
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
		} else if (deadEntity.lastAffectedByEntity.cardId === CardIds.NonCollectible.Neutral.SeabreakerGoliath2) {
			const otherPirates = otherBoard
				.filter((entity) => isCorrectTribe(allCards.getCard(entity.cardId).race, Race.PIRATE))
				.filter((entity) => entity.entityId !== deadEntity.lastAffectedByEntity.entityId);
			otherPirates.forEach((pirate) => {
				modifyAttack(pirate, 2, boardWithDeadEntity, allCards);
				modifyHealth(pirate, 2);
				afterStatsUpdate(pirate, boardWithDeadEntity, allCards);
				spectator.registerPowerTarget(deadEntity.lastAffectedByEntity, pirate, otherBoard);
			});
		} else if (deadEntity.lastAffectedByEntity.cardId === CardIds.NonCollectible.Neutral.SeabreakerGoliathBattlegrounds) {
			const otherPirates = otherBoard
				.filter((entity) => isCorrectTribe(allCards.getCard(entity.cardId).race, Race.PIRATE))
				.filter((entity) => entity.entityId !== deadEntity.lastAffectedByEntity.entityId);
			otherPirates.forEach((pirate) => {
				modifyAttack(pirate, 4, boardWithDeadEntity, allCards);
				modifyHealth(pirate, 4);
				afterStatsUpdate(pirate, boardWithDeadEntity, allCards);
				spectator.registerPowerTarget(deadEntity.lastAffectedByEntity, pirate, otherBoard);
			});
		}
		// else if (deadEntity.lastAffectedByEntity.cardId === CardIds.NonCollectible.Neutral.NatPagleExtremeAngler) {
		// }
	}

	const rivendare = boardWithDeadEntity.find((entity) => entity.cardId === CardIds.Collectible.Neutral.BaronRivendare2);
	const goldenRivendare = boardWithDeadEntity.find(
		(entity) => entity.cardId === CardIds.NonCollectible.Neutral.BaronRivendareBattlegrounds,
	);
	const multiplier = goldenRivendare ? 3 : rivendare ? 2 : 1;
	if (deadEntity.cardId === CardIds.Collectible.Neutral.UnstableGhoul) {
		dealDamageToAllMinions(
			boardWithDeadEntity,
			boardWithDeadEntityHero,
			otherBoard,
			otherBoardHero,
			deadEntity,
			multiplier * 1,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
	} else if (deadEntity.cardId === CardIds.NonCollectible.Neutral.UnstableGhoulBattlegrounds) {
		dealDamageToAllMinions(
			boardWithDeadEntity,
			boardWithDeadEntityHero,
			otherBoard,
			otherBoardHero,
			deadEntity,
			multiplier * 2,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
	}

	// Avenge
	updateAvengeCounters(boardWithDeadEntity);
	const avengers = boardWithDeadEntity.filter((e) => !!e.avengeDefault && e.avengeCurrent === 0);
	for (const avenger of avengers) {
		handleAvenge(
			boardWithDeadEntity,
			boardWithDeadEntityHero,
			avenger,
			otherBoard,
			otherBoardHero,
			cardsData,
			sharedState,
			spectator,
			allCards,
		);
	}
};

const updateAvengeCounters = (board: readonly BoardEntity[]) => {
	for (const entity of board) {
		if (entity.avengeDefault) {
			entity.avengeCurrent -= 1;
		}
	}
};

const handleAvenge = (
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	avenger: BoardEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
	allCards: AllCardsService,
) => {
	// Don't forget to update the avenge data in cards-data
	switch (avenger.cardId) {
		case CardIds.NonCollectible.Neutral.BirdBuddy:
			addStatsToBoard(avenger, boardWithDeadEntity, 1, 1, allCards, spectator, 'BEAST');
			break;
		case CardIds.NonCollectible.Neutral.BirdBuddyBattlegrounds:
			addStatsToBoard(avenger, boardWithDeadEntity, 2, 2, allCards, spectator, 'BEAST');
			break;
		case CardIds.NonCollectible.Neutral.BuddingGreenthumb:
		case CardIds.NonCollectible.Neutral.BuddingGreenthumbBattlegrounds:
			const neighbours = getNeighbours(boardWithDeadEntity, avenger);
			neighbours.forEach((entity) => {
				modifyAttack(
					entity,
					avenger.cardId === CardIds.NonCollectible.Neutral.BuddingGreenthumbBattlegrounds ? 4 : 2,
					boardWithDeadEntity,
					allCards,
				);
				modifyHealth(entity, avenger.cardId === CardIds.NonCollectible.Neutral.BuddingGreenthumbBattlegrounds ? 2 : 1);
				afterStatsUpdate(entity, boardWithDeadEntity, allCards);
				spectator.registerPowerTarget(avenger, entity, boardWithDeadEntity);
			});
			break;
		case CardIds.NonCollectible.Neutral.PalescaleCrocolisk:
			const target1 = grantRandomStats(avenger, boardWithDeadEntity, 6, 6, Race.BEAST, allCards, spectator);
			if (!!target1) {
				spectator.registerPowerTarget(avenger, target1, boardWithDeadEntity);
			}
			break;
		case CardIds.NonCollectible.Neutral.PalescaleCrocoliskBattlegrounds:
			const target2 = grantRandomStats(avenger, boardWithDeadEntity, 12, 12, Race.BEAST, allCards, spectator);
			if (!!target2) {
				spectator.registerPowerTarget(avenger, target2, boardWithDeadEntity);
			}
			break;
		case CardIds.NonCollectible.Neutral.ImpatientDoomsayer:
			addCardsInHand(boardWithDeadEntityHero, 1, boardWithDeadEntity, allCards, spectator);
			break;
		case CardIds.NonCollectible.Neutral.ImpatientDoomsayerBattlegrounds:
			addCardsInHand(boardWithDeadEntityHero, 2, boardWithDeadEntity, allCards, spectator);
			break;
		case CardIds.NonCollectible.Neutral.WitchwingNestmatron:
			addCardsInHand(boardWithDeadEntityHero, 1, boardWithDeadEntity, allCards, spectator);
			break;
		case CardIds.NonCollectible.Neutral.WitchwingNestmatronBattlegrounds:
			addCardsInHand(boardWithDeadEntityHero, 2, boardWithDeadEntity, allCards, spectator);
			break;
		case CardIds.NonCollectible.Neutral.Sisefin:
			const murloc = getRandomMinion(boardWithDeadEntity, Race.MURLOC, allCards);
			if (murloc) {
				murloc.poisonous = true;
				spectator.registerPowerTarget(avenger, murloc, boardWithDeadEntity);
			}
			break;
		case CardIds.NonCollectible.Neutral.SisefinBattlegrounds:
			for (let i = 0; i < 2; i++) {
				const murloc2 = getRandomMinion(boardWithDeadEntity, Race.MURLOC, allCards);
				if (murloc2) {
					murloc2.poisonous = true;
					spectator.registerPowerTarget(avenger, murloc2, boardWithDeadEntity);
				}
			}
			break;
		case CardIds.NonCollectible.Neutral.MechanoTank:
			dealDamageToEnemy(
				// This can be null if the avenge triggers when the last enemy minion dies as well
				getRandomMinionWithHighestHealth(otherBoard),
				otherBoard,
				otherBoardHero,
				avenger,
				6,
				boardWithDeadEntity,
				boardWithDeadEntityHero,
				allCards,
				cardsData,
				sharedState,
				spectator,
			);
			break;
		case CardIds.NonCollectible.Neutral.MechanoTankBattlegrounds:
			for (let i = 0; i < 2; i++) {
				dealDamageToEnemy(
					getRandomMinionWithHighestHealth(otherBoard),
					otherBoard,
					otherBoardHero,
					avenger,
					6,
					boardWithDeadEntity,
					boardWithDeadEntityHero,
					allCards,
					cardsData,
					sharedState,
					spectator,
				);
			}
			break;
		case CardIds.NonCollectible.Neutral.TonyTwoTusk:
			const nonGoldenMinions = boardWithDeadEntity
				.filter((e) => e.entityId !== avenger.entityId)
				.filter((e) => {
					const ref = allCards.getCard(e.cardId);
					return !!ref.battlegroundsPremiumDbfId && !!allCards.getCardFromDbfId(ref.battlegroundsPremiumDbfId).id;
				});
			const pirate = getRandomMinion(nonGoldenMinions, Race.PIRATE, allCards);
			if (pirate) {
				const refCard = allCards.getCard(pirate.cardId);
				const goldenCard = allCards.getCardFromDbfId(refCard.battlegroundsPremiumDbfId);
				pirate.cardId = goldenCard.id;
				spectator.registerPowerTarget(avenger, pirate, boardWithDeadEntity);
			}
			break;
		case CardIds.NonCollectible.Neutral.TonyTwoTuskBattlegrounds:
			for (let i = 0; i < 2; i++) {
				const nonGoldenMinions = boardWithDeadEntity.filter((e) => {
					const ref = allCards.getCard(e.cardId);
					return !!ref.battlegroundsPremiumDbfId;
				});
				const pirate = getRandomMinion(nonGoldenMinions, Race.PIRATE, allCards);
				if (pirate) {
					const refCard = allCards.getCard(pirate.cardId);
					pirate.cardId = refCard.id;
					spectator.registerPowerTarget(avenger, pirate, boardWithDeadEntity);
				}
			}
			break;
	}
	avenger.avengeCurrent = avenger.avengeDefault;
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
	const jugglers = boardWithJugglers.filter((entity) => entity.cardId === CardIds.NonCollectible.Warlock.SoulJuggler);
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
	const goldenJugglers = boardWithJugglers.filter((entity) => entity.cardId === CardIds.NonCollectible.Warlock.SoulJugglerBattlegrounds);
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
		if (board[i].cardId === CardIds.Collectible.Hunter.ScavengingHyenaLegacy) {
			modifyAttack(board[i], 2, board, allCards);
			modifyHealth(board[i], 1);
			afterStatsUpdate(board[i], board, allCards);
			spectator.registerPowerTarget(board[i], board[i], board);
		} else if (board[i].cardId === CardIds.NonCollectible.Hunter.ScavengingHyenaBattlegrounds) {
			modifyAttack(board[i], 4, board, allCards);
			modifyHealth(board[i], 2);
			afterStatsUpdate(board[i], board, allCards);
			spectator.registerPowerTarget(board[i], board[i], board);
		}
	}
};

const applyJunkbotEffect = (board: BoardEntity[], allCards: AllCardsService, spectator: Spectator): void => {
	for (let i = 0; i < board.length; i++) {
		if (board[i].cardId === CardIds.Collectible.Neutral.Junkbot) {
			modifyAttack(board[i], 2, board, allCards);
			modifyHealth(board[i], 2);
			afterStatsUpdate(board[i], board, allCards);
			spectator.registerPowerTarget(board[i], board[i], board);
		} else if (board[i].cardId === CardIds.NonCollectible.Neutral.JunkbotBattlegrounds) {
			modifyAttack(board[i], 4, board, allCards);
			modifyHealth(board[i], 4);
			afterStatsUpdate(board[i], board, allCards);
			spectator.registerPowerTarget(board[i], board[i], board);
		}
	}
};

// const applyQirajiHarbringerEffect = (board: BoardEntity[], deadEntityIndex: number, allCards: AllCardsService): void => {
// 	const qiraji = board.filter((entity) => entity.cardId === CardIds.NonCollectible.Neutral.QirajiHarbinger);
// 	const goldenQiraji = board.filter((entity) => entity.cardId === CardIds.NonCollectible.Neutral.QirajiHarbingerBattlegrounds);
// 	const neighbours = getNeighbours(board, null, deadEntityIndex);

// 	// TODO: if reactivated, properly apply buffs one by one, instead of all together

// 	neighbours.forEach((entity) => {
// 		modifyAttack(entity, 2 * qiraji.length + 4 * goldenQiraji.length, board, allCards);
// 		modifyHealth(entity, 2 * qiraji.length + 4 * goldenQiraji.length);
// 		afterStatsUpdate(entity, board, allCards);
// 	});
// };

const grantRandomAttack = (
	source: BoardEntity,
	board: BoardEntity[],
	additionalAttack: number,
	allCards: AllCardsService,
	spectator: Spectator,
): void => {
	if (board.length > 0) {
		const target = board[Math.floor(Math.random() * board.length)];
		modifyAttack(target, additionalAttack, board, allCards);
		afterStatsUpdate(target, board, allCards);
		spectator.registerPowerTarget(source, target, board);
	}
};

const grantRandomHealth = (
	source: BoardEntity,
	board: BoardEntity[],
	health: number,
	allCards: AllCardsService,
	spectator: Spectator,
): void => {
	if (board.length > 0) {
		const target = board[Math.floor(Math.random() * board.length)];
		modifyHealth(target, health);
		afterStatsUpdate(target, board, allCards);
		spectator.registerPowerTarget(source, target, board);
	}
};

const grantRandomStats = (
	source: BoardEntity,
	board: BoardEntity[],
	attack: number,
	health: number,
	race: Race,
	allCards: AllCardsService,
	spectator: Spectator,
): BoardEntity => {
	if (board.length > 0) {
		const validBeast: BoardEntity = getRandomMinion(board, race, allCards);
		if (validBeast) {
			modifyAttack(validBeast, attack, board, allCards);
			modifyHealth(validBeast, health);
			afterStatsUpdate(validBeast, board, allCards);
			spectator.registerPowerTarget(source, validBeast, board);
			return validBeast;
		}
	}
	return null;
};

export const addCardsInHand = (
	playerEntity: BgsPlayerEntity,
	cards: number,
	board: BoardEntity[],
	allCards: AllCardsService,
	spectator: Spectator,
): void => {
	playerEntity.cardsInHand = Math.min(10, (playerEntity.cardsInHand ?? 0) + cards);

	const peggys = board.filter(
		(e) =>
			e.cardId === CardIds.NonCollectible.Neutral.PeggyBrittlebone ||
			e.cardId === CardIds.NonCollectible.Neutral.PeggyBrittleboneBattlegrounds,
	);
	peggys.forEach((peggy) => {
		const pirate = getRandomMinion(
			board.filter((e) => e.entityId !== peggy.entityId),
			Race.PIRATE,
			allCards,
		);
		if (pirate) {
			modifyAttack(pirate, peggy.cardId === CardIds.NonCollectible.Neutral.PeggyBrittleboneBattlegrounds ? 2 : 1, board, allCards);
			modifyHealth(pirate, peggy.cardId === CardIds.NonCollectible.Neutral.PeggyBrittleboneBattlegrounds ? 2 : 1);
			afterStatsUpdate(pirate, board, allCards);
			spectator.registerPowerTarget(peggy, pirate, board);
		}
	});
};

const grantRandomDivineShield = (source: BoardEntity, board: BoardEntity[], spectator: Spectator): void => {
	const elligibleEntities = board.filter((entity) => !entity.divineShield);
	if (elligibleEntities.length > 0) {
		const chosen = elligibleEntities[Math.floor(Math.random() * elligibleEntities.length)];
		chosen.divineShield = true;
		spectator.registerPowerTarget(source, chosen, board);
	}
	// return board;
};

const grantAllDivineShield = (board: BoardEntity[], tribe: string, cards: AllCardsService): void => {
	const elligibleEntities = board
		.filter((entity) => !entity.divineShield)
		.filter((entity) => isCorrectTribe(cards.getCard(entity.cardId).race, getRaceEnum(tribe)));
	for (const entity of elligibleEntities) {
		entity.divineShield = true;
	}
	// return board;
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
				CardIds.NonCollectible.Neutral.ReplicatingMenace_ReplicatingMenaceEnchantment,
				CardIds.NonCollectible.Neutral.ReplicatingMenace_ReplicatingMenaceEnchantmentBattlegrounds,
				CardIds.NonCollectible.Neutral.LivingSpores_LivingSporesEnchantment,
			].includes(enchantmentId),
		);
	// console.debug('remembering deathrattles', fish.cardId, stringifySimple(deadEntities), validDeathrattles, validEnchantments);
	const newDeathrattles = [...validDeathrattles, ...validEnchantments];
	// Order is important
	if (fish.cardId === CardIds.NonCollectible.Neutral.FishOfNzothBattlegrounds) {
		// https://stackoverflow.com/questions/33305152/how-to-duplicate-elements-in-a-js-array
		const doubleDr = [...validDeathrattles, ...validEnchantments].reduce((res, current) => res.concat([current, current]), []);
		fish.rememberedDeathrattles = [...doubleDr, ...(fish.rememberedDeathrattles || [])];
	} else {
		fish.rememberedDeathrattles = [...newDeathrattles, ...(fish.rememberedDeathrattles || [])];
	}
	// console.debug('remembered dr', fish.rememberedDeathrattles);
};

const removeOldMurkEyeAttack = (boardWithDeadEntity: BoardEntity[], allCards: AllCardsService) => {
	const murkeyes = boardWithDeadEntity.filter(
		(entity) =>
			entity.cardId === CardIds.Collectible.Neutral.OldMurkEyeLegacy ||
			entity.cardId === CardIds.Collectible.Neutral.OldMurkEyeVanilla,
	);
	const goldenMurkeyes = boardWithDeadEntity.filter((entity) => entity.cardId === CardIds.NonCollectible.Neutral.OldMurkEyeBattlegrounds);
	murkeyes.forEach((entity) => {
		modifyAttack(entity, -1, boardWithDeadEntity, allCards);
		afterStatsUpdate(entity, boardWithDeadEntity, allCards);
	});
	goldenMurkeyes.forEach((entity) => {
		modifyAttack(entity, -2, boardWithDeadEntity, allCards);
		afterStatsUpdate(entity, boardWithDeadEntity, allCards);
	});
};
