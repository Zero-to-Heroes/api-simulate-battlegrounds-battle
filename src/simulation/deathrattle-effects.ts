/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds, CardType, GameTag, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import {
	hasDeathrattleEffect,
	hasDeathrattleEnchantmentEffect as hasDeathrattleEffectEnchantmentEffect,
} from '../cards/card.interface';
import { CardsData } from '../cards/cards-data';
import { cardMappings } from '../cards/impl/_card-mappings';
import { grantRandomDivineShield, updateDivineShield } from '../keywords/divine-shield';
import { updateTaunt } from '../keywords/taunt';
import { updateWindfury } from '../keywords/windfury';
import { pickMultipleRandomDifferent, pickRandom, pickRandomAlive, pickRandomLowestHealth } from '../services/utils';
import { isValidDeathrattleEnchantment } from '../simulate-bgs-battle';
import {
	addStatsToBoard,
	grantRandomAttack,
	grantRandomStats,
	grantStatsToMinionsOfEachType,
	hasCorrectTribe,
	hasMechanic,
	isFish,
	isGolden,
} from '../utils';
import {
	dealDamageToMinion,
	dealDamageToRandomEnemy,
	findNearestEnemies,
	getNeighbours,
	processMinionDeath,
} from './attack';
import { addCardsInHand } from './cards-in-hand';
import { DeathrattleTriggeredInput, onDeathrattleTriggered } from './deathrattle-on-trigger';
import { spawnEntities } from './deathrattle-spawns';
import { FullGameState } from './internal-game-state';
import { groupLeapfroggerDeathrattles } from './remembered-deathrattle';
import { SharedState } from './shared-state';
import { modifyStats } from './stats';
import { makeMinionGolden } from './utils/golden';

export const computeDeathrattleMultiplier = (
	board: BoardEntity[],
	boardHero: BgsPlayerEntity,
	deadEntity: BoardEntity,
	sharedState: SharedState,
): number => {
	const rivendare =
		!!board.find(
			(entity) =>
				entity.cardId === CardIds.BaronRivendare_BG_FP1_031 ||
				entity.cardId === CardIds.MoiraBronzebeard_BG27_518,
		) || boardHero.secrets?.some((e) => e.cardId === CardIds.TitusTribute_BG28_843);
	const goldenRivendare = board.find(
		(entity) =>
			entity.cardId === CardIds.BaronRivendare_TB_BaconUps_055 ||
			entity.cardId === CardIds.MoiraBronzebeard_BG27_518_G,
	);
	const titus = board.filter((entity) => entity.cardId === CardIds.TitusRivendare_BG25_354).length;
	const goldenTitus = board.filter((entity) => entity.cardId === CardIds.TitusRivendare_BG25_354_G).length;
	const deathlyPhylacteries = boardHero.trinkets.filter(
		(t) => t.cardId === CardIds.DeathlyPhylactery_BG30_MagicItem_700 && t.scriptDataNum1 > 0,
	).length;
	const tombs =
		boardHero.questRewardEntities?.filter((entity) => entity.cardId === CardIds.TurbulentTombs)?.length ?? 0;
	const echoesOfArgus = sharedState.anomalies.includes(CardIds.EchoesOfArgus_BG27_Anomaly_802) ? 1 : 0;
	const scourgeMultiplier = deadEntity.additionalCards?.includes(CardIds.ScourgeTroll) ? 2 : 1;

	const multiplier =
		scourgeMultiplier *
		((goldenRivendare ? 3 : rivendare ? 2 : 1) +
			deathlyPhylacteries +
			titus +
			2 * goldenTitus +
			tombs +
			echoesOfArgus);
	return multiplier;
};

// export const handleDeathrattles = (
// 	boardWithKilledMinion: BoardEntity[],
// 	boardWithKilledMinionHero: BgsPlayerEntity,
// 	deadEntity: BoardEntity,
// 	deadMinionIndexFromRight2: number,
// 	opponentBoard: BoardEntity[],
// 	opponentBoardHero: BgsPlayerEntity,
// 	entitiesDeadThisAttack: readonly BoardEntity[],
// 	gameState: InternalGameState,
// ) => {};

export const handleDeathrattleEffects = (
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	deadEntity: BoardEntity,
	deadEntityIndexFromRight: number,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	const multiplier = computeDeathrattleMultiplier(
		boardWithDeadEntity,
		boardWithDeadEntityHero,
		deadEntity,
		gameState.sharedState,
	);
	const deathrattleTriggeredInput: DeathrattleTriggeredInput = {
		boardWithDeadEntity,
		boardWithDeadEntityHero,
		deadEntity,
		otherBoard,
		otherBoardHero,
		deadEntityIndexFromRight,
		gameState,
	};

	// We do it on a case by case basis so that we deal all the damage in one go for instance
	// and avoid proccing deathrattle spawns between the times the damage triggers
	const cardIds = [deadEntity.cardId, ...(deadEntity.additionalCards ?? [])];

	// We compute the enchantments first, so that we don't include enchantments created by the just-processed
	// deathrattles
	// It's important to first copy the enchantments, otherwise you could end up
	// in an infinite loop - since new enchants are added after each step
	const enchantments: { cardId: string; originEntityId?: number; repeats?: number }[] = [
		...(deadEntity.enchantments ?? []),
		// These seem to be first processed separately
		// ...(deadEntity.rememberedDeathrattles ?? []),
	].sort((a, b) => a.timing - b.timing);
	// In some cases it's possible that there are way too many enchantments because of the frog
	// In that case, we make a trade-off and don't trigger the "on stats change" trigger as
	// often as we should, so that we can have the stats themselves correct
	// We don't want to lump everything together, as it skews the stats when there are a lot of buffs
	// Instead, we build groups
	// Rework this again when Leapfrogger goes back in
	// const maxNumberOfGroups = 12;
	// const enchantmentGroups = groupByFunction((enchantment: any) => enchantment.cardId)(enchantments);
	// enchantments = Object.keys(enchantmentGroups)
	// 	.filter((cardId) => VALID_DEATHRATTLE_ENCHANTMENTS.includes(cardId as CardIds))
	// 	.flatMap((cardId) => {
	// 		let repeatsToApply = enchantmentGroups[cardId].map((e) => e.repeats || 1).reduce((a, b) => a + b, 0);
	// 		// Frogs include the multiplers here directly
	// 		if (
	// 			[
	// 				CardIds.Leapfrogger_LeapfrogginEnchantment_BG21_000e,
	// 				CardIds.Leapfrogger_LeapfrogginEnchantment_BG21_000_Ge,
	// 			].includes(cardId as CardIds)
	// 		) {
	// 			repeatsToApply = repeatsToApply * multiplier;
	// 		}

	// 		const results = [];
	// 		const repeatsPerBuff = Math.max(1, Math.floor(repeatsToApply / maxNumberOfGroups));
	// 		let repeatsDone = 0;
	// 		while (repeatsDone < repeatsToApply) {
	// 			const repeats = Math.min(repeatsPerBuff, repeatsToApply - repeatsDone);
	// 			results.push({
	// 				cardId: cardId,
	// 				repeats: repeats,
	// 				timing: Math.min(...enchantmentGroups[cardId].map((e) => e.timing)),
	// 			});
	// 			repeatsDone += repeatsPerBuff;
	// 		}
	// 		return results;
	// 	});

	// FIXME; this is not correct, as fish can have leapfrogger card Id OR enchantment id as a
	// remembered deathrattle, and the remembered deathrattle is handled only via the card id
	// TODO put the muliplier look here, and handle onDeathrattleTriggered like is done for
	// deathrattle-spawns
	for (const deadEntityCardId of cardIds) {
		const deathrattleImpl = cardMappings[deadEntityCardId];
		if (hasDeathrattleEffect(deathrattleImpl)) {
			for (let i = 0; i < multiplier; i++) {
				deathrattleImpl.deathrattleEffect(deadEntity, deathrattleTriggeredInput);
				onDeathrattleTriggered(deathrattleTriggeredInput);
			}
		} else {
			switch (deadEntityCardId) {
				case CardIds.SelflessHero_BG_OG_221:
					for (let i = 0; i < multiplier; i++) {
						grantRandomDivineShield(
							deadEntity,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoardHero,
							gameState,
						);
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.SelflessHero_TB_BaconUps_014:
					for (let i = 0; i < multiplier; i++) {
						grantRandomDivineShield(
							deadEntity,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoardHero,
							gameState,
						);
						grantRandomDivineShield(
							deadEntity,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoardHero,
							gameState,
						);
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.SpiritOfAir_TB_BaconShop_HERO_76_Buddy:
				case CardIds.SpiritOfAir_TB_BaconShop_HERO_76_Buddy_G:
					const iterations = deadEntityCardId === CardIds.SpiritOfAir_TB_BaconShop_HERO_76_Buddy_G ? 2 : 1;
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
									updateDivineShield(
										target,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										otherBoardHero,
										true,
										gameState,
									);
								}
								updateTaunt(
									target,
									true,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									otherBoardHero,
									gameState,
								);
								updateWindfury(
									target,
									true,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									otherBoardHero,
									gameState,
								);
								gameState.spectator.registerPowerTarget(
									deadEntity,
									target,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									otherBoardHero,
								);
							}
						}
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.NadinaTheRed_BGS_040:
				case CardIds.NadinaTheRed_TB_BaconUps_154:
					for (let i = 0; i < multiplier; i++) {
						const nadinaMultiplier = deadEntityCardId === CardIds.NadinaTheRed_TB_BaconUps_154 ? 6 : 3;
						for (let j = 0; j < nadinaMultiplier; j++) {
							const validTargets = boardWithDeadEntity
								.filter((e) =>
									hasCorrectTribe(
										e,
										boardWithDeadEntityHero,
										Race.DRAGON,
										gameState.anomalies,
										gameState.allCards,
									),
								)
								.filter((entity) => !entity.divineShield);
							const target = pickRandom(validTargets);
							if (target) {
								updateDivineShield(
									target,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									otherBoardHero,
									true,
									gameState,
								);
								gameState.spectator.registerPowerTarget(
									deadEntity,
									target,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									otherBoardHero,
								);
							}
						}
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.SpawnOfNzoth_BG_OG_256:
					for (let i = 0; i < multiplier; i++) {
						addStatsToBoard(deadEntity, boardWithDeadEntity, boardWithDeadEntityHero, 1, 1, gameState);
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.SpawnOfNzoth_TB_BaconUps_025:
					for (let i = 0; i < multiplier; i++) {
						addStatsToBoard(deadEntity, boardWithDeadEntity, boardWithDeadEntityHero, 2, 2, gameState);
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.SilithidBurrower_BG29_871:
				case CardIds.SilithidBurrower_BG29_871_G:
					const silithidStats = deadEntity.cardId === CardIds.SilithidBurrower_BG29_871_G ? 2 : 1;
					for (let i = 0; i < multiplier; i++) {
						addStatsToBoard(
							deadEntity,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							silithidStats,
							silithidStats,
							gameState,
							Race[Race.BEAST],
						);
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.FiendishServant_YOD_026:
					for (let i = 0; i < multiplier; i++) {
						grantRandomAttack(
							deadEntity,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							deadEntity.attack,
							gameState,
						);
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.FiendishServant_TB_BaconUps_112:
					for (let i = 0; i < multiplier; i++) {
						grantRandomAttack(
							deadEntity,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							deadEntity.attack,
							gameState,
						);
						grantRandomAttack(
							deadEntity,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							deadEntity.attack,
							gameState,
						);
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.NightbaneIgnited_BG29_815:
				case CardIds.NightbaneIgnited_BG29_815_G:
					const nightbaneLoops = deadEntityCardId === CardIds.NightbaneIgnited_BG29_815_G ? 2 : 1;
					for (let i = 0; i < multiplier; i++) {
						for (let j = 0; j < nightbaneLoops; j++) {
							const pickedTargetEntityIds = [];
							for (let k = 0; k < 2; k++) {
								const target = pickRandomAlive(
									boardWithDeadEntity
										.filter(
											(e) =>
												![
													CardIds.NightbaneIgnited_BG29_815,
													CardIds.NightbaneIgnited_BG29_815_G,
												].includes(e.cardId as CardIds),
										)
										.filter((e) => !pickedTargetEntityIds.includes(e.entityId)),
								);
								if (!!target) {
									pickedTargetEntityIds.push(target.entityId);
									modifyStats(
										target,
										deadEntity.attack,
										0,
										boardWithDeadEntity,
										boardWithDeadEntityHero,
										gameState,
									);
									gameState.spectator.registerPowerTarget(
										deadEntity,
										target,
										boardWithDeadEntity,
										null,
										null,
									);
								}
							}
						}
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.Leapfrogger_BG21_000:
					for (let i = 0; i < multiplier; i++) {
						// console.log('\t', 'Leapfrogger from DR', deadEntity.entityId);
						applyLeapFroggerEffect(
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							deadEntity,
							false,
							gameState,
							deadEntity.deathrattleRepeats,
						);
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.Leapfrogger_BG21_000_G:
					for (let i = 0; i < multiplier; i++) {
						applyLeapFroggerEffect(
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							deadEntity,
							true,
							gameState,
							deadEntity.deathrattleRepeats,
						);
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.PalescaleCrocolisk_BG21_001:
					for (let i = 0; i < multiplier; i++) {
						const target = grantRandomStats(
							deadEntity,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							6,
							6,
							Race.BEAST,
							true,
							gameState,
						);
						if (!!target) {
							gameState.spectator.registerPowerTarget(
								deadEntity,
								target,
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								otherBoardHero,
							);
						}
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.PalescaleCrocolisk_BG21_001_G:
					for (let i = 0; i < multiplier; i++) {
						const target = grantRandomStats(
							deadEntity,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							12,
							12,
							Race.BEAST,
							true,
							gameState,
						);
						if (!!target) {
							gameState.spectator.registerPowerTarget(
								deadEntity,
								target,
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								otherBoardHero,
							);
						}
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.ScarletSkull_BG25_022:
				case CardIds.ScarletSkull_BG25_022_G:
					const scarletMultiplier = deadEntityCardId === CardIds.ScarletSkull_BG25_022_G ? 2 : 1;
					for (let i = 0; i < multiplier; i++) {
						const target = grantRandomStats(
							deadEntity,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							scarletMultiplier * 1,
							scarletMultiplier * 2,
							Race.UNDEAD,
							false,
							gameState,
						);
						if (!!target) {
							gameState.spectator.registerPowerTarget(
								deadEntity,
								target,
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								otherBoardHero,
							);
						}
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.ElementiumSquirrelBomb_TB_BaconShop_HERO_17_Buddy:
				case CardIds.ElementiumSquirrelBomb_TB_BaconShop_HERO_17_Buddy_G:
					// FIXME: I don't think this way of doing things is really accurate (as some deathrattles
					// could be spawned between the shots firing), but let's say it's good enough for now
					const squirrelDamage =
						deadEntity.cardId === CardIds.ElementiumSquirrelBomb_TB_BaconShop_HERO_17_Buddy_G ? 4 : 2;
					for (let i = 0; i < multiplier; i++) {
						const numberOfDeadMechsThisCombat = gameState.sharedState.deaths
							.filter((entity) => entity.friendly === deadEntity.friendly)
							// eslint-disable-next-line prettier/prettier
							.filter((entity) =>
								hasCorrectTribe(
									entity,
									boardWithDeadEntityHero,
									Race.MECH,
									gameState.anomalies,
									gameState.allCards,
								),
							).length;
						for (let j = 0; j < numberOfDeadMechsThisCombat; j++) {
							dealDamageToRandomEnemy(
								otherBoard,
								otherBoardHero,
								deadEntity,
								squirrelDamage,
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								gameState,
							);
						}
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.KaboomBot_BG_BOT_606:
				case CardIds.KaboomBot_TB_BaconUps_028:
					// FIXME: I don't think this way of doing things is really accurate (as some deathrattles
					// could be spawned between the shots firing), but let's say it's good enough for now
					const kaboomLoops = deadEntity.cardId === CardIds.KaboomBot_TB_BaconUps_028 ? 2 : 1;
					const baseDamage =
						4 +
						boardWithDeadEntityHero.trinkets.filter(
							(t) => t.cardId === CardIds.KaboomBotPortrait_BG30_MagicItem_803,
						).length *
							10;
					for (let i = 0; i < multiplier; i++) {
						for (let j = 0; j < kaboomLoops; j++) {
							dealDamageToRandomEnemy(
								otherBoard,
								otherBoardHero,
								deadEntity,
								baseDamage,
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								gameState,
							);
						}
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.FireDancer_BG29_843:
				case CardIds.FireDancer_BG29_843_G:
					const fireDancerLoops = deadEntity.cardId === CardIds.FireDancer_BG29_843_G ? 2 : 1;
					for (let i = 0; i < multiplier; i++) {
						for (let j = 0; j < fireDancerLoops; j++) {
							// In case there are spawns, don't target them
							const minionsToDamage = [...otherBoard, ...boardWithDeadEntity];
							for (const target of minionsToDamage) {
								const isSameSide = target.friendly === deadEntity.friendly;
								const board = isSameSide ? boardWithDeadEntity : otherBoard;
								const hero = isSameSide ? boardWithDeadEntityHero : otherBoardHero;
								dealDamageToMinion(
									target,
									board,
									hero,
									deadEntity,
									1,
									isSameSide ? otherBoard : boardWithDeadEntity,
									isSameSide ? otherBoardHero : boardWithDeadEntityHero,
									gameState,
								);
							}
						}
						// Most likely there is a death loop after each round of damage, see
						// http://replays.firestoneapp.com/?reviewId=4b6e4d8d-fc83-4795-b450-4cd0c3a518be&turn=17&action=2
						// Update 13/05/2024: the death process is probably between each deathrattle proc, but not each
						// individual tick. See
						// http://replays.firestoneapp.com/?reviewId=6d66b90d-5678-4a68-a45f-7ddb887f9450&turn=17&action=11
						processMinionDeath(
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							gameState,
						);
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.LighterFighter_BG28_968:
				case CardIds.LighterFighter_BG28_968_G:
					// FIXME: I don't think this way of doing things is really accurate (as some deathrattles
					// could be spawned between the shots firing), but let's say it's good enough for now
					const lighterFighterDamage = deadEntity.cardId === CardIds.LighterFighter_BG28_968_G ? 8 : 4;
					for (let i = 0; i < multiplier; i++) {
						for (let j = 0; j < 2; j++) {
							const target = pickRandomLowestHealth(otherBoard);
							gameState.spectator.registerPowerTarget(
								deadEntity,
								target,
								otherBoard,
								boardWithDeadEntityHero,
								otherBoardHero,
							);
							dealDamageToMinion(
								target,
								otherBoard,
								otherBoardHero,
								deadEntity,
								lighterFighterDamage,
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								gameState,
							);
						}
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.DrBoombox_BG25_165:
				case CardIds.DrBoombox_BG25_165_G:
					// FIXME: I don't think this way of doing things is really accurate (as some deathrattles
					// could be spawned between the shots firing), but let's say it's good enough for now
					const boomboxDamage = deadEntity.cardId === CardIds.DrBoombox_BG25_165_G ? 14 : 7;
					for (let i = 0; i < multiplier; i++) {
						// The nearest enemies use the full board info
						// const boardIncludingDeadEntityAtCorrectIndex = boardWithDeadEntity.splice(
						// 	deadEntityIndexFromRight,
						// 	0,
						// 	deadEntity,
						// );
						const targets = findNearestEnemies(
							boardWithDeadEntity,
							null,
							deadEntityIndexFromRight,
							otherBoard,
							2,
							gameState.allCards,
						);
						targets.forEach((target) => {
							// console.debug('dealing damage to', stringifySimpleCard(target));
							dealDamageToMinion(
								target,
								otherBoard,
								otherBoardHero,
								deadEntity,
								boomboxDamage,
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								gameState,
							);
						});
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.UnstableGhoul_BG_FP1_024:
				case CardIds.UnstableGhoul_TB_BaconUps_118:
					const damage = deadEntityCardId === CardIds.UnstableGhoul_TB_BaconUps_118 ? 2 : 1;
					for (let i = 0; i < multiplier; i++) {
						// In case there are spawns, don't target them
						const minionsToDamage = [...otherBoard, ...boardWithDeadEntity];
						for (const target of minionsToDamage) {
							const isSameSide = target.friendly === deadEntity.friendly;
							const board = isSameSide ? boardWithDeadEntity : otherBoard;
							const hero = isSameSide ? boardWithDeadEntityHero : otherBoardHero;
							dealDamageToMinion(
								target,
								board,
								hero,
								deadEntity,
								damage,
								isSameSide ? otherBoard : boardWithDeadEntity,
								isSameSide ? otherBoardHero : boardWithDeadEntityHero,
								gameState,
							);
						}
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.RadioStar_BG25_399:
				case CardIds.RadioStar_BG25_399_G:
					for (let i = 0; i < multiplier; i++) {
						const radioQuantity = deadEntityCardId === CardIds.RadioStar_BG25_399_G ? 2 : 1;
						const radioEntities = Array(radioQuantity).fill(deadEntity.lastAffectedByEntity);
						addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, radioEntities, gameState);
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.MysticSporebat_BG28_900:
				case CardIds.MysticSporebat_BG28_900_G:
					for (let i = 0; i < multiplier; i++) {
						const loops = deadEntityCardId === CardIds.MysticSporebat_BG28_900_G ? 2 : 1;
						const cardsToAdd = Array(loops).fill(null);
						addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, cardsToAdd, gameState);
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.SrTombDiver_TB_BaconShop_HERO_41_Buddy:
				case CardIds.SrTombDiver_TB_BaconShop_HERO_41_Buddy_G:
					for (let i = 0; i < multiplier; i++) {
						const numberToGild =
							deadEntityCardId === CardIds.SrTombDiver_TB_BaconShop_HERO_41_Buddy_G ? 2 : 1;
						const targetBoard = boardWithDeadEntity.filter((e) => !e.definitelyDead && e.health > 0);
						// .filter((e) => !gameState.cardsData.isGolden(gameState.allCards.getCard(e.cardId)));
						for (let i = 0; i < Math.min(numberToGild, boardWithDeadEntity.length); i++) {
							const rightMostMinion = targetBoard[targetBoard.length - 1 - i];
							if (rightMostMinion) {
								makeMinionGolden(
									rightMostMinion,
									deadEntity,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									otherBoard,
									otherBoardHero,
									gameState,
								);
							}
						}
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.Scourfin_BG26_360:
				case CardIds.Scourfin_BG26_360_G:
					const statsScourfin = deadEntityCardId === CardIds.Scourfin_BG26_360_G ? 10 : 5;
					for (let i = 0; i < multiplier; i++) {
						grantRandomStats(
							deadEntity,
							boardWithDeadEntityHero.hand.filter(
								(e) =>
									gameState.allCards.getCard(e.cardId).type?.toUpperCase() ===
									CardType[CardType.MINION],
							),
							boardWithDeadEntityHero,
							statsScourfin,
							statsScourfin,
							null,
							true,
							gameState,
						);
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.SanguineChampion_BG23_017:
				case CardIds.SanguineChampion_BG23_017_G:
					for (let i = 0; i < multiplier; i++) {
						const sanguineChampionStats = deadEntityCardId === CardIds.SanguineChampion_BG23_017 ? 1 : 2;
						boardWithDeadEntityHero.globalInfo.BloodGemAttackBonus += sanguineChampionStats;
						boardWithDeadEntityHero.globalInfo.BloodGemHealthBonus += sanguineChampionStats;
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.PricklyPiper_BG26_160:
				case CardIds.PricklyPiper_BG26_160_G:
					for (let i = 0; i < multiplier; i++) {
						const piperBuff = deadEntityCardId === CardIds.PricklyPiper_BG26_160 ? 1 : 2;
						boardWithDeadEntityHero.globalInfo.BloodGemAttackBonus += piperBuff;
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;

				// Putricide-only
				case CardIds.Banshee_BG_RLK_957:
					for (let i = 0; i < multiplier; i++) {
						addStatsToBoard(
							deadEntity,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							2,
							1,
							gameState,
							Race[Race.UNDEAD],
						);
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.LostSpirit_BG26_GIL_513:
					for (let i = 0; i < multiplier; i++) {
						addStatsToBoard(
							deadEntity,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							1,
							0,
							gameState,
							null,
						);
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.TickingAbomination_BG_ICC_099:
					for (let i = 0; i < multiplier; i++) {
						for (const entity of boardWithDeadEntity) {
							dealDamageToMinion(
								entity,
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								deadEntity,
								5,
								otherBoard,
								otherBoardHero,
								gameState,
							);
						}
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.WitheredSpearhide_BG27_006:
				case CardIds.WitheredSpearhide_BG27_006_G:
					for (let i = 0; i < multiplier; i++) {
						const witheredSpearhideCardsToAdd = Array(
							deadEntity.cardId === CardIds.WitheredSpearhide_BG27_006_G ? 2 : 1,
						).fill(CardIds.BloodGem);
						addCardsInHand(
							boardWithDeadEntityHero,
							boardWithDeadEntity,
							witheredSpearhideCardsToAdd,
							gameState,
						);
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.RecurringNightmare_BG26_055:
				case CardIds.RecurringNightmare_BG26_055_G:
					for (let i = 0; i < multiplier; i++) {
						applyRecurringNightmareDeathrattleEffect(
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							deadEntity,
							deadEntityCardId === CardIds.RecurringNightmare_BG26_055_G,
							gameState,
						);
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.MotleyPhalanx_BG27_080:
				case CardIds.MotleyPhalanx_BG27_080_G:
					const motleyBuff = deadEntity.cardId === CardIds.MotleyPhalanx_BG27_080_G ? 2 : 1;
					for (let i = 0; i < multiplier; i++) {
						grantStatsToMinionsOfEachType(
							deadEntity,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							motleyBuff * 2,
							motleyBuff * 1,
							gameState,
						);
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.MoroesStewardOfDeath_BG28_304:
				case CardIds.MoroesStewardOfDeath_BG28_304_G:
					const moroesBuffAtk = deadEntity.cardId === CardIds.MoroesStewardOfDeath_BG28_304_G ? 4 : 2;
					const moroesBuffHealth = deadEntity.cardId === CardIds.MoroesStewardOfDeath_BG28_304_G ? 8 : 4;
					for (let i = 0; i < multiplier; i++) {
						addStatsToBoard(
							deadEntity,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							moroesBuffAtk,
							moroesBuffHealth,
							gameState,
							Race[Race.UNDEAD],
						);
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.SteadfastSpirit_BG28_306:
				case CardIds.SteadfastSpirit_BG28_306_G:
					const steadfastSpiritBuff = deadEntity.cardId === CardIds.SteadfastSpirit_BG28_306_G ? 2 : 1;
					for (let i = 0; i < multiplier; i++) {
						addStatsToBoard(
							deadEntity,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							steadfastSpiritBuff,
							steadfastSpiritBuff,
							gameState,
						);
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.ScrapScraper_BG26_148:
				case CardIds.ScrapScraper_BG26_148_G:
					for (let i = 0; i < multiplier; i++) {
						const scraperToAddQuantity = deadEntity.cardId === CardIds.ScrapScraper_BG26_148_G ? 2 : 1;
						const scraperCardsToAdd = [];
						for (let i = 0; i < scraperToAddQuantity; i++) {
							scraperCardsToAdd.push(pickRandom(gameState.cardsData.scrapScraperSpawns));
						}
						addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, scraperCardsToAdd, gameState);
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.BarrensConjurer_BG29_862:
				case CardIds.BarrensConjurer_BG29_862_G:
					for (let i = 0; i < multiplier; i++) {
						const conjurerToAddQuantity = deadEntity.cardId === CardIds.BarrensConjurer_BG29_862_G ? 2 : 1;
						const conjurerCardsToAdd = [];
						for (let i = 0; i < conjurerToAddQuantity; i++) {
							conjurerCardsToAdd.push(pickRandom(gameState.cardsData.battlecryMinions));
						}
						addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, conjurerCardsToAdd, gameState);
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.ShadowyConstruct_BG25_HERO_103_Buddy:
				case CardIds.ShadowyConstruct_BG25_HERO_103_Buddy_G:
					for (let i = 0; i < multiplier; i++) {
						const loops = deadEntity.cardId === CardIds.ShadowyConstruct_BG25_HERO_103_Buddy_G ? 2 : 1;
						for (let j = 0; j < loops; j++) {
							const atkBuff = deadEntity.attack;
							const healthBuff = deadEntity.maxHealth;
							const target = pickRandom(
								boardWithDeadEntity.filter((e) => e.entityId !== deadEntity.entityId),
							);
							if (target) {
								modifyStats(
									target,
									atkBuff,
									healthBuff,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									gameState,
								);
								gameState.spectator.registerPowerTarget(
									deadEntity,
									target,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									otherBoardHero,
								);
							}
						}
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				case CardIds.SpikedSavior_BG29_808:
				case CardIds.SpikedSavior_BG29_808_G:
					const spikedSaviorLoops = deadEntity.cardId === CardIds.SpikedSavior_BG29_808_G ? 2 : 1;
					for (let i = 0; i < multiplier; i++) {
						for (let j = 0; j < spikedSaviorLoops; j++) {
							const targetBoard = [...boardWithDeadEntity];
							for (const entity of targetBoard) {
								modifyStats(entity, 0, 1, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
								gameState.spectator?.registerPowerTarget(
									deadEntity,
									entity,
									boardWithDeadEntity,
									null,
									null,
								);
							}
							for (const entity of targetBoard) {
								// Issue: because this can spawn a new minion, the entity indices can be incorrect
								// See sim.sample.1.txt
								// Ideally, I should probably move the minion spawn index to another paradigm: keep the dead minions
								// until there are new spawns, and delete them afterwards, so I can easily refer to their index
								// by just looking them up, and spawning to the right
								// However, since this doesn't work, maybe I can look for entity indices adjustments needed
								// by looking up the position changes of other minions?
								// Not sure how this could work without creating a giant mess, so for now it will probably
								// stay as a bug
								dealDamageToMinion(
									entity,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									deadEntity,
									1,
									otherBoard,
									otherBoardHero,
									gameState,
								);
							}
						}
						onDeathrattleTriggered(deathrattleTriggeredInput);
					}
					break;
				// Add all the deathrattles that don't have an effect on combat
				// case CardIds.FieryFelblood_BG29_877:
				// case CardIds.FieryFelblood_BG29_877_G:
				default:
					if (hasMechanic(gameState.allCards.getCard(deadEntity.cardId), GameTag[GameTag.DEATHRATTLE])) {
						for (let i = 0; i < multiplier; i++) {
							onDeathrattleTriggered(deathrattleTriggeredInput);
						}
					}
					break;
			}
		}
	}

	for (const enchantment of enchantments) {
		const deathrattleImpl = cardMappings[enchantment.cardId];
		if (hasDeathrattleEffectEnchantmentEffect(deathrattleImpl)) {
			for (let i = 0; i < multiplier; i++) {
				deathrattleImpl.deathrattleEffectEnchantmentEffect(enchantment, deathrattleTriggeredInput);
				onDeathrattleTriggered(deathrattleTriggeredInput);
			}
		}
		switch (enchantment.cardId) {
			case CardIds.RustyTrident_TridentsTreasureEnchantment_BG30_MagicItem_917e:
				for (let i = 0; i < multiplier; i++) {
					addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, [null], gameState);
				}
				break;
			case CardIds.HoggyBank_GemInTheBankEnchantment_BG30_MagicItem_411e:
				for (let i = 0; i < multiplier; i++) {
					addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, [CardIds.BloodGem], gameState);
				}
				break;
			case CardIds.Leapfrogger_LeapfrogginEnchantment_BG21_000e:
			case CardIds.Leapfrogger_LeapfrogginEnchantment_BG21_000_Ge:
				// console.log('\t', 'Leapfrogger enchantment', enchantment.repeats);
				applyLeapFroggerEffect(
					boardWithDeadEntity,
					boardWithDeadEntityHero,
					deadEntity,
					enchantment.cardId === CardIds.Leapfrogger_LeapfrogginEnchantment_BG21_000_Ge,
					gameState,
					enchantment.repeats || 1,
				);
				onDeathrattleTriggered(deathrattleTriggeredInput);
				break;
			case CardIds.EarthRecollectionEnchantment:
				for (let i = 0; i < multiplier; i++) {
					applyEarthInvocationEnchantment(boardWithDeadEntity, deadEntity, deadEntity, gameState);
					onDeathrattleTriggered(deathrattleTriggeredInput);
				}
				break;
			case CardIds.FireRecollectionEnchantment:
				for (let i = 0; i < multiplier; i++) {
					applyFireInvocationEnchantment(
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						deadEntity,
						deadEntity,
						gameState,
					);
					onDeathrattleTriggered(deathrattleTriggeredInput);
				}
				break;
			case CardIds.WaterRecollectionEnchantment:
				for (let i = 0; i < multiplier; i++) {
					applyWaterInvocationEnchantment(
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoardHero,
						deadEntity,
						deadEntity,
						gameState,
					);
					onDeathrattleTriggered(deathrattleTriggeredInput);
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
						gameState,
					);
					onDeathrattleTriggered(deathrattleTriggeredInput);
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
	gameState: FullGameState,
): void => {
	// Because the golden version doubles all the remembered effects
	const multiplier = deadEntity?.cardId === CardIds.SpiritRaptor_BG22_HERO_001_Buddy_G ? 2 : 1;
	for (let i = 0; i < multiplier; i++) {
		const targets = pickMultipleRandomDifferent(otherBoard, 5);
		for (const target of targets) {
			dealDamageToMinion(
				target,
				otherBoard,
				otherBoardHero,
				deadEntity,
				1,
				boardWithDeadEntity,
				boardWithDeadEntityHero,
				gameState,
			);
		}
	}
};

export const applyWaterInvocationEnchantment = (
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	otherHero: BgsPlayerEntity,
	deadEntity: BoardEntity, // Can be null when trinket is used
	sourceEntity: BgsPlayerEntity | BoardEntity,
	gameState: FullGameState,
): void => {
	const multiplier = deadEntity?.cardId === CardIds.SpiritRaptor_BG22_HERO_001_Buddy_G ? 2 : 1;
	for (let i = 0; i < multiplier; i++) {
		const validBoard = boardWithDeadEntity.filter((e) => e.health > 0 && !e.definitelyDead);
		const target: BoardEntity = validBoard[validBoard.length - 1];
		if (!!target) {
			updateTaunt(target, true, boardWithDeadEntity, boardWithDeadEntityHero, otherHero, gameState);
			modifyStats(target, 0, 3, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
			gameState.spectator.registerPowerTarget(sourceEntity, target, boardWithDeadEntity, null, null);
		}
	}
};

export const applyFireInvocationEnchantment = (
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	deadEntity: BoardEntity,
	sourceEntity: BgsPlayerEntity | BoardEntity,
	gameState: FullGameState,
): void => {
	const multiplier = deadEntity?.cardId === CardIds.SpiritRaptor_BG22_HERO_001_Buddy_G ? 2 : 1;
	for (let i = 0; i < multiplier; i++) {
		const target: BoardEntity = boardWithDeadEntity.filter((e) => e.health > 0 && !e.definitelyDead)[0];
		if (!!target) {
			modifyStats(target, target.attack, 0, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
			gameState.spectator.registerPowerTarget(sourceEntity, target, boardWithDeadEntity, null, null);
		}
	}
};

export const applyEarthInvocationEnchantment = (
	boardWithDeadEntity: BoardEntity[],
	deadEntity: BoardEntity,
	sourceEntity: BgsPlayerEntity | BoardEntity,
	gameState: FullGameState,
): void => {
	const multiplier = deadEntity?.cardId === CardIds.SpiritRaptor_BG22_HERO_001_Buddy_G ? 2 : 1;
	for (let i = 0; i < multiplier; i++) {
		const minionsGrantedDeathrattle: BoardEntity[] = pickMultipleRandomDifferent(boardWithDeadEntity, 4);
		minionsGrantedDeathrattle.forEach((minion) => {
			minion.enchantments.push({
				cardId: CardIds.EarthInvocation_ElementEarthEnchantment,
				originEntityId: deadEntity?.entityId,
				timing: gameState.sharedState.currentEntityId++,
			});
			gameState.spectator.registerPowerTarget(sourceEntity, minion, boardWithDeadEntity, null, null);
		});
	}
};

const applyLeapFroggerEffect = (
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	deadEntity: BoardEntity,
	isPremium: boolean,
	gameState: FullGameState,
	multiplier: number,
): void => {
	multiplier = multiplier ?? deadEntity.deathrattleRepeats ?? 1;
	// console.debug('applying leapfrogger effect', deadEntity.entityId, multiplier);
	const buffed = grantRandomStats(
		deadEntity,
		boardWithDeadEntity,
		boardWithDeadEntityHero,
		multiplier * (isPremium ? 2 : 1),
		multiplier * (isPremium ? 2 : 1),
		Race.BEAST,
		false,
		gameState,
	);
	if (buffed) {
		buffed.enchantments = buffed.enchantments ?? [];
		buffed.enchantments.push({
			cardId: isPremium
				? CardIds.Leapfrogger_LeapfrogginEnchantment_BG21_000_Ge
				: CardIds.Leapfrogger_LeapfrogginEnchantment_BG21_000e,
			originEntityId: deadEntity.entityId,
			repeats: multiplier > 1 ? multiplier : 1,
			timing: gameState.sharedState.currentEntityId++,
		});
	}
};

const applyRecurringNightmareDeathrattleEffect = (
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	deadEntity: BoardEntity,
	isPremium: boolean,
	gameState: FullGameState,
	multiplier = 1,
): void => {
	multiplier = multiplier || 1;
	const target = pickRandom(
		boardWithDeadEntity
			.filter((e) =>
				hasCorrectTribe(e, boardWithDeadEntityHero, Race.UNDEAD, gameState.anomalies, gameState.allCards),
			)
			.filter(
				(e) =>
					e.cardId !== CardIds.RecurringNightmare_BG26_055 &&
					e.cardId !== CardIds.RecurringNightmare_BG26_055_G,
			),
	);
	if (target) {
		target.enchantments = target.enchantments ?? [];
		target.enchantments.push({
			cardId: isPremium
				? CardIds.RecurringNightmare_NightmareInsideEnchantment_BG26_055_Ge
				: CardIds.RecurringNightmare_NightmareInsideEnchantment_BG26_055e,
			originEntityId: deadEntity.entityId,
			repeats: multiplier > 1 ? multiplier : 1,
			timing: gameState.sharedState.currentEntityId++,
		});
		gameState.spectator.registerPowerTarget(deadEntity, target, boardWithDeadEntity, null, null);
	}
};

export const handleAfterMinionKillsEffect = (
	deadEntity: BoardEntity,
	deadEntityIndexFromRight: number,
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	const killer = deadEntity.lastAffectedByEntity;
	if (!killer) {
		return;
	}
	// Killed an enemy minion
	if (killer.friendly !== deadEntity.friendly) {
		for (const heroPower of otherBoardHero.heroPowers) {
			if (heroPower.cardId === CardIds.Rokara_GloryOfCombat) {
				modifyStats(killer, 1, 0, otherBoard, otherBoardHero, gameState);
			}
		}

		// Icesnarl the Mighty
		// The timing here might be off, as the following replay suggests that the effect should trigger
		// before Sr. Tomb Diver's deathrattle is applied
		// http://replays.firestoneapp.com/?reviewId=ebb4e2d6-11b4-44f4-a052-3be2c63dd38f&turn=11&action=6
		// Update 2024-30-06: lived tgus ub ab "after minion kills" trigger, let's see how that works
		otherBoard
			.filter(
				(e) =>
					e.cardId === CardIds.IcesnarlTheMighty_BG20_HERO_100_Buddy ||
					e.cardId === CardIds.IcesnarlTheMighty_BG20_HERO_100_Buddy_G,
			)
			.forEach((icesnarl) => {
				modifyStats(
					icesnarl,
					0,
					icesnarl.cardId === CardIds.IcesnarlTheMighty_BG20_HERO_100_Buddy_G ? 2 : 1,
					boardWithDeadEntity,
					boardWithDeadEntityHero,
					gameState,
				);
			});
	}
};

export const applyWheneverMinionDiesEffect = (
	deadEntity: BoardEntity,
	deadEntityIndexFromRight: number,
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	// console.log('applying minion death effect', stringifySimpleCard(deadEntity, allCards));
	if (hasCorrectTribe(deadEntity, boardWithDeadEntityHero, Race.BEAST, gameState.anomalies, gameState.allCards)) {
		applyScavengingHyenaEffect(boardWithDeadEntity, boardWithDeadEntityHero, gameState);
	}
	if (hasCorrectTribe(deadEntity, boardWithDeadEntityHero, Race.DEMON, gameState.anomalies, gameState.allCards)) {
		applySoulJugglerEffect(boardWithDeadEntity, boardWithDeadEntityHero, otherBoard, otherBoardHero, gameState);
	}
	if (hasCorrectTribe(deadEntity, boardWithDeadEntityHero, Race.MECH, gameState.anomalies, gameState.allCards)) {
		applyJunkbotEffect(boardWithDeadEntity, boardWithDeadEntityHero, gameState);
	}
	if (hasCorrectTribe(deadEntity, boardWithDeadEntityHero, Race.MURLOC, gameState.anomalies, gameState.allCards)) {
		removeOldMurkEyeAttack(boardWithDeadEntity, boardWithDeadEntityHero, gameState);
		removeOldMurkEyeAttack(otherBoard, otherBoardHero, gameState);
	}
	if (hasCorrectTribe(deadEntity, boardWithDeadEntityHero, Race.ELEMENTAL, gameState.anomalies, gameState.allCards)) {
		applyMossOfTheSchlossEffect(deadEntity, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
	}

	if (deadEntity.taunt) {
		applyBristlemaneScrapsmithEffect(boardWithDeadEntity, boardWithDeadEntityHero, gameState);
		applyQirajiHarbringerEffect(boardWithDeadEntity, boardWithDeadEntityHero, deadEntityIndexFromRight, gameState);
	}

	if (
		deadEntity.cardId === CardIds.EternalKnight_BG25_008 ||
		deadEntity.cardId === CardIds.EternalKnight_BG25_008_G
	) {
		applyEternalKnightEffect(boardWithDeadEntity, boardWithDeadEntityHero, gameState);
	}

	// Putricide-only
	boardWithDeadEntity
		.filter((e) => e.additionalCards?.includes(CardIds.FlesheatingGhoulLegacy_BG26_tt_004))
		.forEach((e) => {
			modifyStats(e, 1, 0, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
		});

	applyRotHideGnollEffect(boardWithDeadEntity, boardWithDeadEntityHero, gameState);

	// Overkill
	if (
		deadEntity.health < 0 &&
		gameState.sharedState.currentAttackerEntityId != null &&
		gameState.sharedState.currentAttackerEntityId === deadEntity.lastAffectedByEntity?.entityId
	) {
		if (deadEntity.lastAffectedByEntity.cardId === CardIds.HeraldOfFlame_BGS_032) {
			const targets = boardWithDeadEntity.filter((entity) => entity.health > 0 && !entity.definitelyDead);
			if (targets.length > 0) {
				const target = targets[0];
				dealDamageToMinion(
					target,
					boardWithDeadEntity,
					boardWithDeadEntityHero,
					deadEntity.lastAffectedByEntity,
					3,
					otherBoard,
					otherBoardHero,
					gameState,
				);
			}
		} else if (deadEntity.lastAffectedByEntity.cardId === CardIds.HeraldOfFlame_TB_BaconUps_103) {
			const targets = boardWithDeadEntity.filter((entity) => entity.health > 0 && !entity.definitelyDead);
			if (targets.length > 0) {
				const target = targets[0];
				dealDamageToMinion(
					target,
					boardWithDeadEntity,
					boardWithDeadEntityHero,
					deadEntity.lastAffectedByEntity,
					6,
					otherBoard,
					otherBoardHero,
					gameState,
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
		else if (deadEntity.lastAffectedByEntity.cardId === CardIds.IronhideDirehorn_TRL_232) {
			const newEntities = spawnEntities(
				CardIds.IronhideDirehorn_IronhideRuntToken_TRL_232t,
				1,
				otherBoard,
				otherBoardHero,
				boardWithDeadEntity,
				boardWithDeadEntityHero,
				gameState,
				!deadEntity.friendly,
				false,
			);
			otherBoard.splice(otherBoard.length - deadEntityIndexFromRight, 0, ...newEntities);
		} else if (deadEntity.lastAffectedByEntity.cardId === CardIds.IronhideDirehorn_TB_BaconUps_051) {
			const newEntities = spawnEntities(
				CardIds.IronhideDirehorn_IronhideRuntToken_TB_BaconUps_051t,
				1,
				otherBoard,
				otherBoardHero,
				boardWithDeadEntity,
				boardWithDeadEntityHero,
				gameState,
				!deadEntity.friendly,
				false,
			);
			otherBoard.splice(otherBoard.length - deadEntityIndexFromRight, 0, ...newEntities);
		} else if (deadEntity.lastAffectedByEntity.cardId === CardIds.SeabreakerGoliath_BGS_080) {
			const otherPirates = otherBoard
				.filter((entity) =>
					hasCorrectTribe(
						entity,
						boardWithDeadEntityHero,
						Race.PIRATE,
						gameState.anomalies,
						gameState.allCards,
					),
				)
				.filter((entity) => entity.entityId !== deadEntity.lastAffectedByEntity.entityId);
			otherPirates.forEach((pirate) => {
				modifyStats(pirate, 2, 2, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
				gameState.spectator.registerPowerTarget(
					deadEntity.lastAffectedByEntity,
					pirate,
					otherBoard,
					null,
					null,
				);
			});
		} else if (deadEntity.lastAffectedByEntity.cardId === CardIds.SeabreakerGoliath_TB_BaconUps_142) {
			const otherPirates = otherBoard
				.filter((entity) =>
					hasCorrectTribe(
						entity,
						boardWithDeadEntityHero,
						Race.PIRATE,
						gameState.anomalies,
						gameState.allCards,
					),
				)
				.filter((entity) => entity.entityId !== deadEntity.lastAffectedByEntity.entityId);
			otherPirates.forEach((pirate) => {
				modifyStats(pirate, 4, 4, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
				gameState.spectator.registerPowerTarget(
					deadEntity.lastAffectedByEntity,
					pirate,
					otherBoard,
					null,
					null,
				);
			});
		}
	}
};

/** @deprecated */
export const dealDamageToAllMinions = (
	board1: BoardEntity[],
	board1Hero: BgsPlayerEntity,
	board2: BoardEntity[],
	board2Hero: BgsPlayerEntity,
	damageSource: BoardEntity,
	damageDealt: number,
	gameState: FullGameState,
): void => {
	if (board1.length === 0 && board2.length === 0) {
		return;
	}
	for (let i = 0; i < board1.length; i++) {
		dealDamageToMinion(board1[i], board1, board1Hero, damageSource, damageDealt, board2, board2Hero, gameState);
	}
	for (let i = 0; i < board2.length; i++) {
		dealDamageToMinion(board2[i], board2, board2Hero, damageSource, damageDealt, board1, board1Hero, gameState);
	}
};

const applySoulJugglerEffect = (
	boardWithJugglers: BoardEntity[],
	boardWithJugglersHero: BgsPlayerEntity,
	boardToAttack: BoardEntity[],
	boardToAttackHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	if (boardWithJugglers.length === 0 && boardToAttack.length === 0) {
		return;
		// return [boardWithJugglers, boardToAttack];
	}
	const jugglers = boardWithJugglers.filter((entity) => entity.cardId === CardIds.SoulJuggler_BGS_002);
	for (const juggler of jugglers) {
		dealDamageToRandomEnemy(
			boardToAttack,
			boardToAttackHero,
			juggler,
			3,
			boardWithJugglers,
			boardWithJugglersHero,
			gameState,
		);
	}
	const goldenJugglers = boardWithJugglers.filter((entity) => entity.cardId === CardIds.SoulJuggler_TB_BaconUps_075);
	for (const juggler of goldenJugglers) {
		dealDamageToRandomEnemy(
			boardToAttack,
			boardToAttackHero,
			juggler,
			3,
			boardWithJugglers,
			boardWithJugglersHero,
			gameState,
		);
		dealDamageToRandomEnemy(
			boardToAttack,
			boardToAttackHero,
			juggler,
			3,
			boardWithJugglers,
			boardWithJugglersHero,
			gameState,
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

const applyScavengingHyenaEffect = (
	board: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	// const copy = [...board];
	for (let i = 0; i < board.length; i++) {
		if (board[i].cardId === CardIds.ScavengingHyenaLegacy_BG_EX1_531) {
			modifyStats(board[i], 2, 1, board, boardWithDeadEntityHero, gameState);
			gameState.spectator.registerPowerTarget(board[i], board[i], board, null, null);
		} else if (board[i].cardId === CardIds.ScavengingHyenaLegacy_TB_BaconUps_043) {
			modifyStats(board[i], 4, 2, board, boardWithDeadEntityHero, gameState);
			gameState.spectator.registerPowerTarget(board[i], board[i], board, null, null);
		}
	}
};

const applyEternalKnightEffect = (board: BoardEntity[], hero: BgsPlayerEntity, gameState: FullGameState): void => {
	for (let i = 0; i < board.length; i++) {
		if (
			board[i].cardId === CardIds.EternalKnight_BG25_008 ||
			board[i].cardId === CardIds.EternalKnight_BG25_008_G
		) {
			const multiplier = board[i].cardId === CardIds.EternalKnight_BG25_008_G ? 2 : 1;
			modifyStats(board[i], multiplier * 1, multiplier * 1, board, hero, gameState);
			gameState.spectator.registerPowerTarget(board[i], board[i], board, null, null);
		}
	}
};

const applyRotHideGnollEffect = (board: BoardEntity[], hero: BgsPlayerEntity, gameState: FullGameState): void => {
	for (let i = 0; i < board.length; i++) {
		if (board[i].cardId === CardIds.RotHideGnoll_BG25_013 || board[i].cardId === CardIds.RotHideGnoll_BG25_013_G) {
			const multiplier = board[i].cardId === CardIds.RotHideGnoll_BG25_013_G ? 2 : 1;
			modifyStats(board[i], multiplier * 1, 0, board, hero, gameState);
			gameState.spectator.registerPowerTarget(board[i], board[i], board, null, null);
		}
	}
};

const applyBristlemaneScrapsmithEffect = (
	board: BoardEntity[],
	boardPlayerEntity: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	for (let i = 0; i < board.length; i++) {
		if (
			board[i].cardId === CardIds.BristlemaneScrapsmith_BG24_707 ||
			board[i].cardId === CardIds.BristlemaneScrapsmith_BG24_707_G
		) {
			const cardsToAdd = Array(CardIds.BristlemaneScrapsmith_BG24_707_G ? 2 : 1).fill(CardIds.BloodGem);
			addCardsInHand(boardPlayerEntity, board, cardsToAdd, gameState);
			gameState.spectator.registerPowerTarget(board[i], board[i], board, boardPlayerEntity, null);
		}
	}
};

const applyMossOfTheSchlossEffect = (
	deadEntity: BoardEntity,
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	board
		.filter(
			(e) => e.cardId === CardIds.MossOfTheSchloss_BG30_111 || e.cardId === CardIds.MossOfTheSchloss_BG30_111_G,
		)
		.filter((e) => e.abiityChargesLeft > 0)
		.forEach((entity) => {
			modifyStats(entity, deadEntity.maxAttack, deadEntity.maxHealth, board, hero, gameState);
			entity.abiityChargesLeft--;
			gameState.spectator.registerPowerTarget(entity, entity, board, null, null);
		});
};

const applyJunkbotEffect = (board: BoardEntity[], hero: BgsPlayerEntity, gameState: FullGameState): void => {
	for (let i = 0; i < board.length; i++) {
		if (board[i].cardId === CardIds.Junkbot_GVG_106) {
			modifyStats(board[i], 2, 2, board, hero, gameState);
			gameState.spectator.registerPowerTarget(board[i], board[i], board, null, null);
		} else if (board[i].cardId === CardIds.Junkbot_TB_BaconUps_046) {
			modifyStats(board[i], 4, 4, board, hero, gameState);
			gameState.spectator.registerPowerTarget(board[i], board[i], board, null, null);
		}
	}
};

const applyQirajiHarbringerEffect = (
	board: BoardEntity[],
	hero: BgsPlayerEntity,
	deadEntityIndexFromRight: number,
	gameState: FullGameState,
): void => {
	const qiraji = board.filter((entity) => entity.cardId === CardIds.QirajiHarbinger_BGS_112);
	const goldenQiraji = board.filter((entity) => entity.cardId === CardIds.QirajiHarbinger_TB_BaconUps_303);

	// TODO: if reactivated, properly apply buffs one by one, instead of all together
	if (qiraji.length + goldenQiraji.length > 0) {
		const neighbours = getNeighbours(board, null, deadEntityIndexFromRight);
		const buff = 2 * qiraji.length + 4 * goldenQiraji.length;
		neighbours.forEach((entity) => {
			modifyStats(entity, buff, buff, board, hero, gameState);
		});
	}
};

export const applyMonstrosity = (
	monstrosity: BoardEntity,
	deadEntities: readonly BoardEntity[],
	boardWithDeadEntities: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	for (const deadEntity of deadEntities) {
		modifyStats(monstrosity, deadEntity.attack, 0, boardWithDeadEntities, boardWithDeadEntityHero, gameState);
		if (monstrosity.cardId === CardIds.Monstrosity_BG20_HERO_282_Buddy_G) {
			modifyStats(monstrosity, deadEntity.attack, 0, boardWithDeadEntities, boardWithDeadEntityHero, gameState);
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
	if (!deadEntities?.length) {
		return;
	}

	const validDeathrattles = deadEntities
		.filter(
			(entity) =>
				allCards.getCard(entity.cardId).mechanics?.includes(GameTag[GameTag.DEATHRATTLE]) || isFish(entity),
		)
		.map((entity) => ({
			cardId: entity.cardId,
			repeats: 1,
			timing: sharedState.currentEntityId++,
			memory: entity.memory,
		}));
	const validEnchantments = deadEntities
		.filter((entity) => entity.enchantments?.length)
		.map((entity) => entity.enchantments)
		.reduce((a, b) => a.concat(b), [])
		.flatMap((enchantment) => ({
			cardId: enchantment.cardId,
			repeats: enchantment.repeats ?? 1,
			timing: sharedState.currentEntityId++,
		}))
		.filter((enchantment) => isValidDeathrattleEnchantment(enchantment.cardId));
	// Multiple fish
	const deadEntityRememberedDeathrattles =
		deadEntities
			.filter((e) => !!e.rememberedDeathrattles?.length)
			// If the fish has reborn, it will inherit its own Deathrattles, and we don't want that
			.filter((e) => e.entityId !== fish.rebornFromEntityId)
			.flatMap((e) => e.rememberedDeathrattles) ?? [];
	const newDeathrattles = [...validDeathrattles, ...validEnchantments, ...deadEntityRememberedDeathrattles];

	if (newDeathrattles.length > 0) {
		// Order is important - the DR are triggered in the order d the minions have died
		if (isGolden(fish.cardId, allCards)) {
			// https://stackoverflow.com/questions/33305152/how-to-duplicate-elements-in-a-js-array
			const doubleDr = newDeathrattles.reduce((res, current) => res.concat([current, current]), []);
			fish.rememberedDeathrattles = [...(fish.rememberedDeathrattles || []), ...doubleDr];
		} else {
			fish.rememberedDeathrattles = [...(fish.rememberedDeathrattles || []), ...newDeathrattles];
		}

		if (newDeathrattles.some((d) => d.cardId?.startsWith(CardIds.Leapfrogger_BG21_000))) {
			// Not sure exactly why, but if a leapfrogger dies first, then a manasaber,
			// when the fish dies, the manasaber's effect (spawning tokens) is triggered first
			// https://replays.firestoneapp.com/?reviewId=521733fb-8ba1-4663-9a87-3da58e8a09c8&turn=21&action=3
			// HACK: So I will hardcode a rule for now to put leapfrogger effects last
			const leapfroggerDeathrattles = groupLeapfroggerDeathrattles(fish.rememberedDeathrattles);
			fish.rememberedDeathrattles = [
				...fish.rememberedDeathrattles.filter((d) => !d.cardId?.startsWith(CardIds.Leapfrogger_BG21_000)),
				...leapfroggerDeathrattles,
			];
		}
	}
	// console.debug(
	// 	'remembered',
	// 	fish.cardId,
	// 	fish.entityId,
	// 	fish.rememberedDeathrattles.map((d) => ({
	// 		cardId: d.cardId,
	// 		name: allCards.getCard(d.cardId)?.name,
	// 		// repeats: d.repeats,
	// 		// timing: d.timing,
	// 	})),
	// );
};

const removeOldMurkEyeAttack = (
	boardWithDeadEntity: BoardEntity[],
	hero: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	const murkeyes = boardWithDeadEntity.filter(
		(entity) => entity.cardId === CardIds.OldMurkEyeLegacy || entity.cardId === CardIds.OldMurkEyeVanilla,
	);
	const goldenMurkeyes = boardWithDeadEntity.filter((entity) => entity.cardId === CardIds.OldMurkEye);
	murkeyes.forEach((entity) => {
		modifyStats(entity, -1, 0, boardWithDeadEntity, hero, gameState);
	});
	goldenMurkeyes.forEach((entity) => {
		modifyStats(entity, -2, 0, boardWithDeadEntity, hero, gameState);
	});
};
