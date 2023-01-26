/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';
import { groupByFunction, pickMultipleRandomDifferent, pickRandom } from '../services/utils';
import {
	addCardsInHand,
	addStatsToBoard,
	afterStatsUpdate,
	grantAllDivineShield,
	grantRandomAttack,
	grantRandomDivineShield,
	grantRandomHealth,
	grantRandomStats,
	hasCorrectTribe,
	isCorrectTribe,
	isFish,
	isGolden,
	makeMinionGolden,
	modifyAttack,
	modifyHealth,
	updateDivineShield,
} from '../utils';
import { dealDamageToEnemy, dealDamageToRandomEnemy } from './attack';
import { spawnEntities } from './deathrattle-spawns';
import { SharedState } from './shared-state';
import { Spectator } from './spectator/spectator';

export const computeDeathrattleMultiplier = (board: BoardEntity[], deadEntity: BoardEntity): number => {
	const rivendare = board.find((entity) => entity.cardId === CardIds.BaronRivendare_BG_FP1_031);
	const goldenRivendare = board.find((entity) => entity.cardId === CardIds.BaronRivendareBattlegrounds);
	const titus = board.filter((entity) => entity.cardId === CardIds.TitusRivendare).length;
	const goldenTitus = board.filter((entity) => entity.cardId === CardIds.TitusRivendareBattlegrounds).length;
	// The multiplication / addition order here is irrelelvant, since Baron has been removed once Titus was introduced
	const scourgeMultiplier = deadEntity.additionalCards?.includes(CardIds.ScourgeTroll) ? 2 : 1;
	const multiplier = scourgeMultiplier * ((goldenRivendare ? 3 : rivendare ? 2 : 1) + titus + 2 * goldenTitus);
	return multiplier;
};

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
	const multiplier = computeDeathrattleMultiplier(boardWithDeadEntity, deadEntity);
	// We do it on a case by case basis so that we deal all the damage in one go for instance
	// and avoid proccing deathrattle spawns between the times the damage triggers

	const cardIds = [deadEntity.cardId, ...(deadEntity.additionalCards ?? [])];
	for (const deadEntityCardId of cardIds) {
		switch (deadEntityCardId) {
			case CardIds.SelflessHero_BG_OG_221:
				for (let i = 0; i < multiplier; i++) {
					grantRandomDivineShield(deadEntity, boardWithDeadEntity, allCards, spectator);
				}
				break;
			case CardIds.SelflessHeroBattlegrounds:
				for (let i = 0; i < multiplier; i++) {
					grantRandomDivineShield(deadEntity, boardWithDeadEntity, allCards, spectator);
					grantRandomDivineShield(deadEntity, boardWithDeadEntity, allCards, spectator);
				}
				break;
			case CardIds.SpiritOfAirBattlegrounds_TB_BaconShop_HERO_76_Buddy:
			case CardIds.SpiritOfAirBattlegrounds_TB_BaconShop_HERO_76_Buddy_G:
				const iterations = deadEntityCardId === CardIds.SpiritOfAirBattlegrounds_TB_BaconShop_HERO_76_Buddy_G ? 2 : 1;
				for (let i = 0; i < multiplier; i++) {
					for (let j = 0; j < iterations; j++) {
						let validTargets = boardWithDeadEntity.filter((entity) => !entity.divineShield);
						if (!validTargets?.length) {
							validTargets = boardWithDeadEntity.filter((entity) => !entity.taunt);
							if (!validTargets?.length) {
								validTargets = boardWithDeadEntity.filter((entity) => !entity.windfury);
							}
						}
						const target = pickRandom(validTargets);
						if (target) {
							if (!target.divineShield) {
								updateDivineShield(target, boardWithDeadEntity, true, allCards);
							}
							target.taunt = true;
							target.windfury = true;
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
			case CardIds.SpawnOfNzoth_BG_OG_256:
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
					applyLeapFroggerEffect(boardWithDeadEntity, deadEntity, false, allCards, spectator, sharedState);
				}
				break;
			case CardIds.LeapfroggerBattlegrounds:
				for (let i = 0; i < multiplier; i++) {
					applyLeapFroggerEffect(boardWithDeadEntity, deadEntity, true, allCards, spectator, sharedState);
				}
				break;
			case CardIds.PalescaleCrocolisk_BG21_001:
				for (let i = 0; i < multiplier; i++) {
					const target = grantRandomStats(deadEntity, boardWithDeadEntity, 6, 6, Race.BEAST, allCards, spectator);
					if (!!target) {
						spectator.registerPowerTarget(deadEntity, target, boardWithDeadEntity);
					}
				}
				break;
			case CardIds.PalescaleCrocolisk_BG21_001_G:
				for (let i = 0; i < multiplier; i++) {
					const target = grantRandomStats(deadEntity, boardWithDeadEntity, 12, 12, Race.BEAST, allCards, spectator);
					if (!!target) {
						spectator.registerPowerTarget(deadEntity, target, boardWithDeadEntity);
					}
				}
				break;
			case CardIds.ScarletSkull:
			case CardIds.ScarletSkullBattlegrounds:
				const scarletMultiplier = deadEntityCardId === CardIds.ScarletSkullBattlegrounds ? 2 : 1;
				for (let i = 0; i < multiplier; i++) {
					const target = grantRandomStats(
						deadEntity,
						boardWithDeadEntity,
						scarletMultiplier * 1,
						scarletMultiplier * 2,
						Race.UNDEAD,
						allCards,
						spectator,
					);
					if (!!target) {
						spectator.registerPowerTarget(deadEntity, target, boardWithDeadEntity);
					}
				}
				break;
			case CardIds.AnubarakNerubianKing:
			case CardIds.AnubarakNerubianKingBattlegrounds:
				const anubarakMultiplier = deadEntityCardId === CardIds.AnubarakNerubianKingBattlegrounds ? 2 : 1;
				const attackBonus = anubarakMultiplier * 1;
				for (let i = 0; i < multiplier; i++) {
					addStatsToBoard(deadEntity, boardWithDeadEntity, attackBonus, 0, allCards, spectator, Race[Race.UNDEAD]);
					boardWithDeadEntityHero.globalInfo.UndeadAttackBonus += attackBonus;
				}
				break;
			case CardIds.ElementiumSquirrelBombBattlegrounds_TB_BaconShop_HERO_17_Buddy:
				// FIXME: I don't think this way of doing things is really accurate (as some deathrattles
				// could be spawned between the shots firing), but let's say it's good enough for now
				for (let i = 0; i < multiplier; i++) {
					const numberOfDeadMechsThisCombat = sharedState.deaths
						.filter((entity) => entity.friendly === deadEntity.friendly)
						// eslint-disable-next-line prettier/prettier
						.filter((entity) => isCorrectTribe(allCards.getCard(entity.cardId)?.races, Race.MECH)).length;
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
			case CardIds.ElementiumSquirrelBombBattlegrounds_TB_BaconShop_HERO_17_Buddy_G:
				// FIXME: I don't think this way of doing things is really accurate (as some deathrattles
				// could be spawned between the shots firing), but let's say it's good enough for now
				for (let i = 0; i < multiplier; i++) {
					const numberOfDeadMechsThisCombat = sharedState.deaths
						.filter((entity) => entity.friendly === deadEntity.friendly)
						// eslint-disable-next-line prettier/prettier
						.filter((entity) => isCorrectTribe(allCards.getCard(entity.cardId)?.races, Race.MECH)).length;
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
			case CardIds.KaboomBot_BG_BOT_606:
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
			case CardIds.UnstableGhoul_BG_FP1_024:
			case CardIds.UnstableGhoulBattlegrounds:
				const damage = deadEntityCardId === CardIds.UnstableGhoulBattlegrounds ? 2 : 1;
				for (let i = 0; i < multiplier; i++) {
					dealDamageToAllMinions(
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						deadEntity,
						damage,
						allCards,
						cardsData,
						sharedState,
						spectator,
					);
				}
				break;
			case CardIds.TunnelBlaster_BG_DAL_775:
			case CardIds.TunnelBlasterBattlegrounds:
				const loops = deadEntityCardId === CardIds.TunnelBlasterBattlegrounds ? 2 : 1;
				for (let i = 0; i < multiplier; i++) {
					for (let j = 0; j < loops; j++) {
						dealDamageToAllMinions(
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							deadEntity,
							3,
							allCards,
							cardsData,
							sharedState,
							spectator,
						);
					}
				}
				break;
			case CardIds.LeeroyTheReckless:
			case CardIds.LeeroyTheRecklessBattlegrounds:
				if (deadEntity.lastAffectedByEntity) {
					deadEntity.lastAffectedByEntity.definitelyDead = true;
				}
				break;
			case CardIds.SrTombDiverBattlegrounds_TB_BaconShop_HERO_41_Buddy:
				for (let i = 0; i < Math.min(1, boardWithDeadEntity.length); i++) {
					const rightMostMinion = boardWithDeadEntity[boardWithDeadEntity.length - 1 - i];
					if (rightMostMinion) {
						makeMinionGolden(rightMostMinion, deadEntity, boardWithDeadEntity, allCards, spectator);
					}
				}
				break;
			case CardIds.SrTombDiverBattlegrounds_TB_BaconShop_HERO_41_Buddy_G:
				for (let i = 0; i < Math.min(2, boardWithDeadEntity.length); i++) {
					const rightMostMinion = boardWithDeadEntity[boardWithDeadEntity.length - 1 - i];
					if (rightMostMinion) {
						makeMinionGolden(rightMostMinion, deadEntity, boardWithDeadEntity, allCards, spectator);
					}
				}
				break;

			// Putricide-only
			case CardIds.Banshee_BG_RLK_957:
				for (let i = 0; i < multiplier; i++) {
					addStatsToBoard(deadEntity, boardWithDeadEntity, 2, 1, allCards, spectator, Race[Race.UNDEAD]);
				}
				break;
			case CardIds.LostSpirit_BG26_GIL_513:
				for (let i = 0; i < multiplier; i++) {
					addStatsToBoard(deadEntity, boardWithDeadEntity, 1, 0, allCards, spectator, null);
				}
				break;
			case CardIds.TickingAbomination_BG_ICC_099:
				for (let i = 0; i < multiplier; i++) {
					for (const entity of boardWithDeadEntity) {
						dealDamageToEnemy(
							entity,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							deadEntity,
							5,
							otherBoard,
							otherBoardHero,
							allCards,
							cardsData,
							sharedState,
							spectator,
						);
					}
				}
				break;
		}
	}

	// It's important to first copy the enchantments, otherwise you could end up
	// in an infinite loop - since new enchants are added after each step

	let enchantments: { cardId: string; originEntityId?: number; repeats?: number }[] = [
		...(deadEntity.enchantments ?? []),
		...(deadEntity.rememberedDeathrattles ?? []),
	].sort((a, b) => a.timing - b.timing);
	// In some cases it's possible that there are way too many enchantments because of the frog
	// In that case, we make a trade-off and don't trigger the "on stats change" trigger as
	// often as we should, so that we can have the stats themselves correct
	// We don't want to lump everything together, as it skews the stats when there are a lot of buffs
	// Instead, we build groups
	const maxNumberOfGroups = 12;
	const enchantmentGroups = groupByFunction((enchantment: any) => enchantment.cardId)(enchantments);
	enchantments = Object.keys(enchantmentGroups).flatMap((cardId) => {
		let repeatsToApply = enchantmentGroups[cardId].map((e) => e.repeats || 1).reduce((a, b) => a + b, 0);

		// Frogs include the multiplers here directly
		if (
			[CardIds.Leapfrogger_LeapfrogginEnchantment_BG21_000e, CardIds.Leapfrogger_LeapfrogginEnchantment_BG21_000_Ge].includes(
				cardId as CardIds,
			)
		) {
			repeatsToApply = repeatsToApply * multiplier;
		}

		const results = [];
		const repeatsPerBuff = Math.max(1, Math.floor(repeatsToApply / maxNumberOfGroups));
		let repeatsDone = 0;
		while (repeatsDone < repeatsToApply) {
			const repeats = Math.min(repeatsPerBuff, repeatsToApply - repeatsDone);
			results.push({
				cardId: cardId,
				repeats: repeats,
				timing: Math.min(...enchantmentGroups[cardId].map((e) => e.timing)),
			});
			repeatsDone += repeatsPerBuff;
		}
		return results;
	});
	for (const enchantment of enchantments) {
		switch (enchantment.cardId) {
			case CardIds.Leapfrogger_LeapfrogginEnchantment_BG21_000e:
			case CardIds.Leapfrogger_LeapfrogginEnchantment_BG21_000_Ge:
				applyLeapFroggerEffect(
					boardWithDeadEntity,
					deadEntity,
					enchantment.cardId === CardIds.Leapfrogger_LeapfrogginEnchantment_BG21_000_Ge,
					allCards,
					spectator,
					sharedState,
					enchantment.repeats || 1,
				);
				break;
			case CardIds.EarthRecollectionEnchantment:
				for (let i = 0; i < multiplier; i++) {
					applyEarthInvocationEnchantment(boardWithDeadEntity, deadEntity, deadEntity, allCards, sharedState, spectator);
				}
				break;
			case CardIds.FireRecollectionEnchantment:
				for (let i = 0; i < multiplier; i++) {
					applyFireInvocationEnchantment(boardWithDeadEntity, deadEntity, deadEntity, allCards, spectator);
				}
				break;
			case CardIds.WaterRecollectionEnchantment:
				for (let i = 0; i < multiplier; i++) {
					applyWaterInvocationEnchantment(boardWithDeadEntity, deadEntity, deadEntity, allCards, spectator);
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
	// const playerCopy = boardWithDeadEntity.map((e) => ({ ...e, lastAffectedByEntity: null }));
	// const oppCopy = otherBoard.map((e) => ({ ...e, lastAffectedByEntity: null }));
	// console.log('player board', boardWithDeadEntity.length, playerCopy.length, playerCopy.map((e) => JSON.stringify(e)).join('\n'));
	// console.log('opp board', JSON.stringify(oppCopy));
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
	sourceEntity: BgsPlayerEntity | BoardEntity,
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
			spectator.registerPowerTarget(sourceEntity, target, boardWithDeadEntity);
		}
	}
};

export const applyFireInvocationEnchantment = (
	boardWithDeadEntity: BoardEntity[],
	deadEntity: BoardEntity,
	sourceEntity: BgsPlayerEntity | BoardEntity,
	allCards: AllCardsService,
	spectator: Spectator,
): void => {
	const multiplier = deadEntity?.cardId === CardIds.SpiritRaptorBattlegrounds ? 2 : 1;
	for (let i = 0; i < multiplier; i++) {
		const target: BoardEntity = boardWithDeadEntity[0];
		if (!!target) {
			modifyAttack(target, target.attack, boardWithDeadEntity, allCards);
			afterStatsUpdate(target, boardWithDeadEntity, allCards);
			spectator.registerPowerTarget(sourceEntity, target, boardWithDeadEntity);
		}
	}
};

export const applyEarthInvocationEnchantment = (
	boardWithDeadEntity: BoardEntity[],
	deadEntity: BoardEntity,
	sourceEntity: BgsPlayerEntity | BoardEntity,
	allCards: AllCardsService,
	sharedState: SharedState,
	spectator: Spectator,
): void => {
	const multiplier = deadEntity?.cardId === CardIds.SpiritRaptorBattlegrounds ? 2 : 1;
	for (let i = 0; i < multiplier; i++) {
		const minionsGrantedDeathrattle: BoardEntity[] = pickMultipleRandomDifferent(boardWithDeadEntity, 4);
		minionsGrantedDeathrattle.forEach((minion) => {
			minion.enchantments.push({
				cardId: CardIds.EarthInvocation_ElementEarthEnchantment,
				originEntityId: deadEntity?.entityId,
				timing: sharedState.currentEntityId++,
			});
			spectator.registerPowerTarget(sourceEntity, minion, boardWithDeadEntity);
		});
	}
};

const applyLeapFroggerEffect = (
	boardWithDeadEntity: BoardEntity[],
	deadEntity: BoardEntity,
	isPremium: boolean,
	allCards: AllCardsService,
	spectator: Spectator,
	sharedState: SharedState,
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
			cardId: isPremium
				? CardIds.Leapfrogger_LeapfrogginEnchantment_BG21_000_Ge
				: CardIds.Leapfrogger_LeapfrogginEnchantment_BG21_000e,
			originEntityId: deadEntity.entityId,
			repeats: multiplier > 1 ? multiplier : 1,
			timing: sharedState.currentEntityId++,
		});
		// Don't register power effect here, since it's already done in the random stats
		// spectator.registerPowerTarget(deadEntity, buffed, boardWithDeadEntity);
		// console.log('applyLeapFroggerEffect', stringifySimpleCard(deadEntity), stringifySimpleCard(buffed));
	}
};

export const applyMinionDeathEffect = (
	deadEntity: BoardEntity,
	deadEntityIndexFromRight: number,
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
	if (isCorrectTribe(allCards.getCard(deadEntity.cardId).races, Race.BEAST)) {
		applyScavengingHyenaEffect(boardWithDeadEntity, allCards, spectator);
	}
	if (isCorrectTribe(allCards.getCard(deadEntity.cardId).races, Race.DEMON)) {
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
	if (isCorrectTribe(allCards.getCard(deadEntity.cardId).races, Race.MECH)) {
		applyJunkbotEffect(boardWithDeadEntity, allCards, spectator);
	}
	if (hasCorrectTribe(deadEntity, Race.MURLOC, allCards)) {
		removeOldMurkEyeAttack(boardWithDeadEntity, allCards);
		removeOldMurkEyeAttack(otherBoard, allCards);
	}
	if (deadEntity.taunt) {
		applyBristlemaneScrapsmithEffect(boardWithDeadEntity, boardWithDeadEntityHero, allCards, spectator);
	}
	if (deadEntity.cardId === CardIds.EternalKnight || deadEntity.cardId === CardIds.EternalKnightBattlegrounds) {
		applyEternalKnightEffect(boardWithDeadEntity, allCards, spectator);
	}

	// Putricide-only
	boardWithDeadEntity
		.filter((e) => e.additionalCards?.includes(CardIds.FlesheatingGhoulLegacy_BG26_tt_004))
		.forEach((e) => {
			modifyAttack(e, 1, boardWithDeadEntity, allCards);
			afterStatsUpdate(e, boardWithDeadEntity, allCards);
		});

	applyRotHideGnollEffect(boardWithDeadEntity, allCards, spectator);

	// Overkill
	if (deadEntity.health < 0 && deadEntity.lastAffectedByEntity?.attacking) {
		if (deadEntity.lastAffectedByEntity.cardId === CardIds.HeraldOfFlame_BGS_032) {
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
		}
		// else if (deadEntity.lastAffectedByEntity.cardId === CardIds.WildfireElemental && deadEntity.lastAffectedByEntity.attacking) {
		// 	// } else if (deadEntity.lastAffectedByEntity.cardId === CardIds.WildfireElemental) {
		// 	// console.log('applying WildfireElemental effect', stringifySimple(boardWithDeadEntity, allCards));
		// 	const excessDamage = -deadEntity.health;
		// 	// Prevent propagation of the effect
		// 	deadEntity.lastAffectedByEntity.attacking = false;
		// 	const neighbours = getNeighbours(boardWithDeadEntity, null, boardWithDeadEntity.length - deadEntityIndexFromRight);
		// 	// console.log('neighbours', stringifySimple(neighbours, allCards));
		// 	if (neighbours.length > 0) {
		// 		const randomTarget = neighbours[Math.floor(Math.random() * neighbours.length)];
		// 		dealDamageToEnemy(
		// 			randomTarget,
		// 			boardWithDeadEntity,
		// 			boardWithDeadEntityHero,
		// 			deadEntity.lastAffectedByEntity,
		// 			excessDamage,
		// 			otherBoard,
		// 			otherBoardHero,
		// 			allCards,
		// 			cardsData,
		// 			sharedState,
		// 			spectator,
		// 		);
		// 	}
		// } else if (
		// 	deadEntity.lastAffectedByEntity.cardId === CardIds.WildfireElementalBattlegrounds &&
		// 	deadEntity.lastAffectedByEntity.attacking
		// ) {
		// 	const excessDamage = -deadEntity.health;
		// 	deadEntity.lastAffectedByEntity.attacking = false;
		// 	const neighbours = getNeighbours(boardWithDeadEntity, null, boardWithDeadEntity.length - deadEntityIndexFromRight);
		// 	neighbours.forEach((neighbour) =>
		// 		dealDamageToEnemy(
		// 			neighbour,
		// 			boardWithDeadEntity,
		// 			boardWithDeadEntityHero,
		// 			deadEntity.lastAffectedByEntity,
		// 			excessDamage,
		// 			otherBoard,
		// 			otherBoardHero,
		// 			allCards,
		// 			cardsData,
		// 			sharedState,
		// 			spectator,
		// 		),
		// 	);
		// }
		else if (deadEntity.lastAffectedByEntity.cardId === CardIds.IronhideDirehorn) {
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
			otherBoard.splice(otherBoard.length - deadEntityIndexFromRight, 0, ...newEntities);
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
			otherBoard.splice(otherBoard.length - deadEntityIndexFromRight, 0, ...newEntities);
		} else if (deadEntity.lastAffectedByEntity.cardId === CardIds.SeabreakerGoliath_BGS_080) {
			const otherPirates = otherBoard
				.filter((entity) => isCorrectTribe(allCards.getCard(entity.cardId).races, Race.PIRATE))
				.filter((entity) => entity.entityId !== deadEntity.lastAffectedByEntity.entityId);
			otherPirates.forEach((pirate) => {
				modifyAttack(pirate, 2, boardWithDeadEntity, allCards);
				modifyHealth(pirate, 2, boardWithDeadEntity, allCards);
				afterStatsUpdate(pirate, boardWithDeadEntity, allCards);
				spectator.registerPowerTarget(deadEntity.lastAffectedByEntity, pirate, otherBoard);
			});
		} else if (deadEntity.lastAffectedByEntity.cardId === CardIds.SeabreakerGoliathBattlegrounds) {
			const otherPirates = otherBoard
				.filter((entity) => isCorrectTribe(allCards.getCard(entity.cardId).races, Race.PIRATE))
				.filter((entity) => entity.entityId !== deadEntity.lastAffectedByEntity.entityId);
			otherPirates.forEach((pirate) => {
				modifyAttack(pirate, 4, boardWithDeadEntity, allCards);
				modifyHealth(pirate, 4, boardWithDeadEntity, allCards);
				afterStatsUpdate(pirate, boardWithDeadEntity, allCards);
				spectator.registerPowerTarget(deadEntity.lastAffectedByEntity, pirate, otherBoard);
			});
		}
	}
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
	}
	for (let i = 0; i < board1.length; i++) {
		dealDamageToEnemy(
			board1[i],
			board1,
			board1Hero,
			damageSource,
			damageDealt,
			board2,
			board2Hero,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
	}
	for (let i = 0; i < board2.length; i++) {
		dealDamageToEnemy(
			board2[i],
			board2,
			board2Hero,
			damageSource,
			damageDealt,
			board1,
			board1Hero,
			allCards,
			cardsData,
			sharedState,
			spectator,
		);
	}
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
		if (board[i].cardId === CardIds.ScavengingHyenaLegacy_BG_EX1_531) {
			modifyAttack(board[i], 2, board, allCards);
			modifyHealth(board[i], 1, board, allCards);
			afterStatsUpdate(board[i], board, allCards);
			spectator.registerPowerTarget(board[i], board[i], board);
		} else if (board[i].cardId === CardIds.ScavengingHyenaLegacyBattlegrounds) {
			modifyAttack(board[i], 4, board, allCards);
			modifyHealth(board[i], 2, board, allCards);
			afterStatsUpdate(board[i], board, allCards);
			spectator.registerPowerTarget(board[i], board[i], board);
		}
	}
};

const applyEternalKnightEffect = (board: BoardEntity[], allCards: AllCardsService, spectator: Spectator): void => {
	for (let i = 0; i < board.length; i++) {
		if (board[i].cardId === CardIds.EternalKnight || board[i].cardId === CardIds.EternalKnightBattlegrounds) {
			const multiplier = board[i].cardId === CardIds.EternalKnightBattlegrounds ? 2 : 1;
			modifyAttack(board[i], multiplier * 1, board, allCards);
			modifyHealth(board[i], multiplier * 1, board, allCards);
			afterStatsUpdate(board[i], board, allCards);
			spectator.registerPowerTarget(board[i], board[i], board);
		}
	}
};

const applyRotHideGnollEffect = (board: BoardEntity[], allCards: AllCardsService, spectator: Spectator): void => {
	for (let i = 0; i < board.length; i++) {
		if (board[i].cardId === CardIds.RotHideGnoll || board[i].cardId === CardIds.RotHideGnollBattlegrounds) {
			const multiplier = board[i].cardId === CardIds.RotHideGnollBattlegrounds ? 2 : 1;
			modifyAttack(board[i], multiplier * 1, board, allCards);
			afterStatsUpdate(board[i], board, allCards);
			spectator.registerPowerTarget(board[i], board[i], board);
		}
	}
};

const applyBristlemaneScrapsmithEffect = (
	board: BoardEntity[],
	boardPlayerEntity: BgsPlayerEntity,
	allCards: AllCardsService,
	spectator: Spectator,
): void => {
	for (let i = 0; i < board.length; i++) {
		if (board[i].cardId === CardIds.BristlemaneScrapsmith || board[i].cardId === CardIds.BristlemaneScrapsmithBattlegrounds) {
			addCardsInHand(
				boardPlayerEntity,
				board[i].cardId === CardIds.BristlemaneScrapsmithBattlegrounds ? 2 : 1,
				board,
				allCards,
				spectator,
			);
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

export const rememberDeathrattles = (
	fish: BoardEntity,
	deadEntities: readonly BoardEntity[],
	cardsData: CardsData,
	allCards: AllCardsService,
	sharedState: SharedState,
): void => {
	const validDeathrattles = deadEntities
		.filter((entity) => cardsData.validDeathrattles.includes(entity.cardId) || isFish(entity))
		.map((entity) => ({ cardId: entity.cardId, repeats: 1, timing: sharedState.currentEntityId++ }));
	const validEnchantments = deadEntities
		.filter((entity) => entity.enchantments?.length)
		.map((entity) => entity.enchantments)
		.reduce((a, b) => a.concat(b), [])
		.flatMap((enchantment) => ({
			cardId: enchantment.cardId,
			repeats: enchantment.repeats ?? 1,
			timing: sharedState.currentEntityId++,
		}))
		.filter((enchantment) =>
			[
				CardIds.ReplicatingMenace_ReplicatingMenaceEnchantment_BG_BOT_312e,
				CardIds.ReplicatingMenace_ReplicatingMenaceEnchantmentBattlegrounds,
				CardIds.Leapfrogger_LeapfrogginEnchantment_BG21_000e,
				CardIds.Leapfrogger_LeapfrogginEnchantment_BG21_000_Ge,
				CardIds.LivingSpores_LivingSporesEnchantment,
				CardIds.SneedsReplicator_ReplicateEnchantment,
				CardIds.EarthInvocation_ElementEarthEnchantment,
				CardIds.FireInvocation_ElementFireEnchantment,
				CardIds.WaterInvocation_ElementWaterEnchantment,
				CardIds.LightningInvocation,
			].includes(enchantment.cardId as CardIds),
		);
	// Multiple fish
	const deadEntityRememberedDeathrattles =
		deadEntities.filter((e) => !!e.rememberedDeathrattles?.length).flatMap((e) => e.rememberedDeathrattles) ?? [];
	const newDeathrattles = [...validDeathrattles, ...validEnchantments, ...deadEntityRememberedDeathrattles];
	// Order is important - the DR are triggered in the ordered the minions have died
	// console.log(
	// 	'remembering deathrattle',
	// 	'\n',
	// 	stringifySimpleCard(fish, allCards),
	// 	'\n',
	// 	stringifySimple(deadEntities, allCards),
	// 	'\n',
	// 	fish.rememberedDeathrattles,
	// );
	if (isGolden(fish.cardId, allCards)) {
		// https://stackoverflow.com/questions/33305152/how-to-duplicate-elements-in-a-js-array
		const doubleDr = newDeathrattles.reduce((res, current) => res.concat([current, current]), []);
		fish.rememberedDeathrattles = [...(fish.rememberedDeathrattles || []), ...doubleDr];
	} else {
		fish.rememberedDeathrattles = [...(fish.rememberedDeathrattles || []), ...newDeathrattles];
	}
	// console.log('remembering deathrattle after', '\n', fish.rememberedDeathrattles);
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
