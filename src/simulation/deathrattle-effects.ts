/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds, CardType, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';
import {
	groupByFunction,
	pickMultipleRandomDifferent,
	pickRandom,
	pickRandomAlive,
	pickRandomLowestHealth,
} from '../services/utils';
import { VALID_ENCHANTMENTS } from '../simulate-bgs-battle';
import {
	addStatsToBoard,
	grantRandomAttack,
	grantRandomDivineShield,
	grantRandomHealth,
	grantRandomStats,
	grantStatsToMinionsOfEachType,
	hasCorrectTribe,
	isCorrectTribe,
	isFish,
	isGolden,
	isPilotedWhirlOTron,
	makeMinionGolden,
	updateDivineShield,
} from '../utils';
import {
	dealDamageToMinion,
	dealDamageToRandomEnemy,
	findNearestEnemies,
	getNeighbours,
	processMinionDeath,
} from './attack';
import { triggerBattlecry } from './battlecries';
import { addCardsInHand } from './cards-in-hand';
import { DeathrattleTriggeredInput, onDeathrattleTriggered } from './deathrattle-on-trigger';
import { spawnEntities } from './deathrattle-spawns';
import { FullGameState } from './internal-game-state';
import { SharedState } from './shared-state';
import { Spectator } from './spectator/spectator';
import { modifyAttack, modifyHealth, onStatsUpdate } from './stats';

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
	const tombs =
		boardHero.questRewardEntities?.filter((entity) => entity.cardId === CardIds.TurbulentTombs)?.length ?? 0;
	const echoesOfArgus = sharedState.anomalies.includes(CardIds.EchoesOfArgus_BG27_Anomaly_802) ? 1 : 0;
	const scourgeMultiplier = deadEntity.additionalCards?.includes(CardIds.ScourgeTroll) ? 2 : 1;

	const multiplier =
		scourgeMultiplier *
		((goldenRivendare ? 3 : rivendare ? 2 : 1) + titus + 2 * goldenTitus + tombs + echoesOfArgus);
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
		gameState,
	};

	// We do it on a case by case basis so that we deal all the damage in one go for instance
	// and avoid proccing deathrattle spawns between the times the damage triggers
	const cardIds = [deadEntity.cardId, ...(deadEntity.additionalCards ?? [])];
	// TODO put the muliplier look here, and handle onDeathrattleTriggered like is done for
	// deathrattle-spawns
	for (const deadEntityCardId of cardIds) {
		switch (deadEntityCardId) {
			case CardIds.RylakMetalhead_BG26_801:
			case CardIds.RylakMetalhead_BG26_801_G:
				// const rylakMutltiplier = deadEntityCardId === CardIds.RylakMetalhead_BG26_801_G ? 2 : 1;
				for (let i = 0; i < multiplier; i++) {
					const allNeighbours = getNeighbours(boardWithDeadEntity, deadEntity, deadEntityIndexFromRight);
					const neighbours =
						deadEntityCardId === CardIds.RylakMetalhead_BG26_801_G
							? allNeighbours
							: [allNeighbours[0]].filter((entity) => !!entity);
					// console.debug(
					// 	'triggering neighbours',
					// 	stringifySimple(neighbours, gameState.allCards),
					// 	stringifySimple(allNeighbours, gameState.allCards),
					// );
					for (const neighbour of neighbours) {
						// console.debug('\ttriggering neighbour', stringifySimpleCard(neighbour, gameState.allCards));
						gameState.spectator.registerPowerTarget(
							deadEntity,
							neighbour,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoardHero,
						);
						// for (let j = 0; j < rylakMutltiplier; j++) {
						triggerBattlecry(
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							neighbour,
							otherBoard,
							otherBoardHero,
							gameState,
						);
						// }
					}
					onDeathrattleTriggered(deathrattleTriggeredInput);
				}
				break;
			case CardIds.SelflessHero_BG_OG_221:
				for (let i = 0; i < multiplier; i++) {
					grantRandomDivineShield(deadEntity, boardWithDeadEntity, gameState.allCards, gameState.spectator);
					onDeathrattleTriggered(deathrattleTriggeredInput);
				}
				break;
			case CardIds.SelflessHero_TB_BaconUps_014:
				for (let i = 0; i < multiplier; i++) {
					grantRandomDivineShield(deadEntity, boardWithDeadEntity, gameState.allCards, gameState.spectator);
					grantRandomDivineShield(deadEntity, boardWithDeadEntity, gameState.allCards, gameState.spectator);
					onDeathrattleTriggered(deathrattleTriggeredInput);
				}
				break;
			case CardIds.OperaticBelcher_BG26_888:
			case CardIds.OperaticBelcher_BG26_888_G:
				const belcherMultiplier = deadEntityCardId === CardIds.OperaticBelcher_BG26_888_G ? 2 : 1;
				for (let i = 0; i < multiplier; i++) {
					for (let j = 0; j < belcherMultiplier; j++) {
						const possibleBelcherTargets = boardWithDeadEntity
							.filter((entity) => !entity.venomous)
							.filter((entity) => !entity.poisonous)
							.filter((entity) => entity.health > 0 && !entity.definitelyDead)
							.filter((entity) => hasCorrectTribe(entity, Race.MURLOC, gameState.allCards));
						if (possibleBelcherTargets.length > 0) {
							const chosen = pickRandom(possibleBelcherTargets);
							chosen.venomous = true;
							gameState.spectator.registerPowerTarget(
								deadEntity,
								chosen,
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								otherBoardHero,
							);
						}
					}
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
								updateDivineShield(target, boardWithDeadEntity, true, gameState.allCards);
							}
							target.taunt = true;
							target.windfury = true;
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
							.filter((e) => hasCorrectTribe(e, Race.DRAGON, gameState.allCards))
							.filter((entity) => !entity.divineShield);
						const target = pickRandom(validTargets);
						if (target) {
							updateDivineShield(target, boardWithDeadEntity, true, gameState.allCards);
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
			case CardIds.GoldrinnTheGreatWolf_BGS_018:
				for (let i = 0; i < multiplier; i++) {
					addStatsToBoard(deadEntity, boardWithDeadEntity, boardWithDeadEntityHero, 3, 2, gameState, 'BEAST');
					boardWithDeadEntityHero.globalInfo.GoldrinnBuffAtk += 4;
					boardWithDeadEntityHero.globalInfo.GoldrinnBuffHealth += 4;
					onDeathrattleTriggered(deathrattleTriggeredInput);
				}
				break;
			case CardIds.GoldrinnTheGreatWolf_TB_BaconUps_085:
				for (let i = 0; i < multiplier; i++) {
					addStatsToBoard(deadEntity, boardWithDeadEntity, boardWithDeadEntityHero, 6, 4, gameState, 'BEAST');
					boardWithDeadEntityHero.globalInfo.GoldrinnBuffAtk += 8;
					boardWithDeadEntityHero.globalInfo.GoldrinnBuffHealth += 8;
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
			// case CardIds.KingBagurgle_BGS_030:
			// 	addStatsToBoard(
			// 		deadEntity,
			// 		boardWithDeadEntity,
			// 		multiplier * 2,
			// 		multiplier * 3,
			// 		gameState.allCards,
			// 		gameState.spectator,
			// 		'MURLOC',
			// 	);
			// 	break;
			// case CardIds.KingBagurgle_TB_BaconUps_100:
			// 	addStatsToBoard(
			// 		deadEntity,
			// 		boardWithDeadEntity,
			// 		multiplier * 4,
			// 		multiplier * 6,
			// 		gameState.allCards,
			// 		gameState.spectator,
			// 		'MURLOC',
			// 	);
			// 	break;
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
			case CardIds.ImpulsiveTrickster_BG21_006:
				for (let i = 0; i < multiplier; i++) {
					grantRandomHealth(
						deadEntity,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						deadEntity.maxHealth,
						gameState,
						true,
					);
					onDeathrattleTriggered(deathrattleTriggeredInput);
				}
				break;
			case CardIds.ImpulsiveTrickster_BG21_006_G:
				for (let i = 0; i < multiplier; i++) {
					grantRandomHealth(
						deadEntity,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						deadEntity.maxHealth,
						gameState,
						true,
					);
					grantRandomHealth(
						deadEntity,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						deadEntity.maxHealth,
						gameState,
						true,
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
								boardWithDeadEntity.filter((e) => !pickedTargetEntityIds.includes(e.entityId)),
							);
							if (!!target) {
								pickedTargetEntityIds.push(target.entityId);
								modifyAttack(
									target,
									deadEntity.attack,
									boardWithDeadEntity,
									boardWithDeadEntityHero,
									gameState,
								);
								onStatsUpdate(target, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
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
					applyLeapFroggerEffect(boardWithDeadEntity, boardWithDeadEntityHero, deadEntity, false, gameState);
					onDeathrattleTriggered(deathrattleTriggeredInput);
				}
				break;
			case CardIds.Leapfrogger_BG21_000_G:
				for (let i = 0; i < multiplier; i++) {
					applyLeapFroggerEffect(boardWithDeadEntity, boardWithDeadEntityHero, deadEntity, true, gameState);
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
			case CardIds.AnubarakNerubianKing_BG25_007:
			case CardIds.AnubarakNerubianKing_BG25_007_G:
				const anubarakMultiplier = deadEntityCardId === CardIds.AnubarakNerubianKing_BG25_007_G ? 2 : 1;
				const attackBonus = anubarakMultiplier * 1;
				for (let i = 0; i < multiplier; i++) {
					boardWithDeadEntityHero.globalInfo.UndeadAttackBonus += attackBonus;
					addStatsToBoard(
						deadEntity,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						attackBonus,
						0,
						gameState,
						Race[Race.UNDEAD],
					);
					onDeathrattleTriggered(deathrattleTriggeredInput);
				}
				break;
			// case CardIds.ElementiumSquirrelBombBattlegrounds_TB_BaconShop_HERO_17_Buddy:
			// 	// FIXME: I don't think this way of doing things is really accurate (as some deathrattles
			// 	// could be spawned between the shots firing), but let's say it's good enough for now
			// 	for (let i = 0; i < multiplier; i++) {
			// 		const numberOfDeadMechsThisCombat = sharedState.deaths
			// 			.filter((entity) => entity.friendly === deadEntity.friendly)
			// 			// eslint-disable-next-line prettier/prettier
			// 			.filter((entity) => isCorrectTribe(allCards.getCard(entity.cardId)?.races, Race.MECH)).length;
			// 		for (let j = 0; j < numberOfDeadMechsThisCombat + 1; j++) {
			// 			dealDamageToRandomEnemy(
			// 				otherBoard,
			// 				otherBoardHero,
			// 				deadEntity,
			// 				3,
			// 				boardWithDeadEntity,
			// 				boardWithDeadEntityHero,
			// 				allCards,
			// 				cardsData,
			// 				sharedState,
			// 				spectator,
			// 			);
			// 		}
			// 	}
			// 	break;
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
							isCorrectTribe(gameState.allCards.getCard(entity.cardId)?.races, Race.MECH),
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
				for (let i = 0; i < multiplier; i++) {
					for (let j = 0; j < kaboomLoops; j++) {
						dealDamageToRandomEnemy(
							otherBoard,
							otherBoardHero,
							deadEntity,
							4,
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

						// Most likely there is a death loop after each round of damage, see
						// http://replays.firestoneapp.com/?reviewId=4b6e4d8d-fc83-4795-b450-4cd0c3a518be&turn=17&action=2
						processMinionDeath(
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							gameState,
						);
					}
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
			case CardIds.TunnelBlaster_BG_DAL_775:
			case CardIds.TunnelBlaster_BG_DAL_775_G:
				const loops = deadEntityCardId === CardIds.TunnelBlaster_BG_DAL_775_G ? 2 : 1;
				for (let i = 0; i < multiplier; i++) {
					for (let j = 0; j < loops; j++) {
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
								3,
								isSameSide ? otherBoard : boardWithDeadEntity,
								isSameSide ? otherBoardHero : boardWithDeadEntityHero,
								gameState,
							);
						}
					}
					onDeathrattleTriggered(deathrattleTriggeredInput);
				}
				break;
			case CardIds.LeeroyTheReckless_BG23_318:
			case CardIds.LeeroyTheReckless_BG23_318_G:
				if (
					deadEntity.lastAffectedByEntity
					// http://replays.firestoneapp.com/?reviewId=c6121cdd-5cb6-4321-807e-4ff644568a8c&turn=25&action=7
					// Update 02/05/2024: this is a bug, and friendly units should be killed
					// deadEntity.friendly !== deadEntity.lastAffectedByEntity.friendly
				) {
					deadEntity.lastAffectedByEntity.definitelyDead = true;
				}
				onDeathrattleTriggered(deathrattleTriggeredInput);
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
					addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, [null], gameState);
				}
				break;
			case CardIds.SrTombDiver_TB_BaconShop_HERO_41_Buddy:
			case CardIds.SrTombDiver_TB_BaconShop_HERO_41_Buddy_G:
				for (let i = 0; i < multiplier; i++) {
					const numberToGild = deadEntityCardId === CardIds.SrTombDiver_TB_BaconShop_HERO_41_Buddy_G ? 2 : 1;
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
								gameState,
							);
						}
					}
					onDeathrattleTriggered(deathrattleTriggeredInput);
				}
				break;
			case CardIds.Scourfin_BG26_360:
			case CardIds.Scourfin_BG26_360_G:
				// When it's the opponent, the game state already contains all the buffs
				if (deadEntity?.friendly) {
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
					addStatsToBoard(deadEntity, boardWithDeadEntity, boardWithDeadEntityHero, 1, 0, gameState, null);
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
						deadEntity,
						deadEntityCardId === CardIds.RecurringNightmare_BG26_055_G,
						gameState.allCards,
						gameState.spectator,
						gameState.sharedState,
					);
					onDeathrattleTriggered(deathrattleTriggeredInput);
				}
				break;
			case CardIds.MotleyPhalanx_BG27_080:
			case CardIds.MotleyPhalanx_BG27_080_G:
				const motleyBuff = deadEntity.cardId === CardIds.MotleyPhalanx_BG27_080_G ? 8 : 4;
				for (let i = 0; i < multiplier; i++) {
					grantStatsToMinionsOfEachType(
						deadEntity,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						motleyBuff,
						motleyBuff,
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
			case CardIds.Mummifier_BG28_309:
			case CardIds.Mummifier_BG28_309_G:
				const mummifierBuff = deadEntity.cardId === CardIds.Mummifier_BG28_309_G ? 2 : 1;
				for (let i = 0; i < multiplier; i++) {
					for (let j = 0; j < mummifierBuff; j++) {
						const targets = boardWithDeadEntity
							.filter(
								(e) =>
									e.cardId !== CardIds.Mummifier_BG28_309 &&
									e.cardId !== CardIds.Mummifier_BG28_309_G,
							)
							.filter((e) => !e.reborn)
							.filter((e) => hasCorrectTribe(e, Race.UNDEAD, gameState.allCards));
						const target = pickRandom(targets);
						if (target) {
							target.reborn = true;
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
			case CardIds.SpikedSavior_BG29_808:
			case CardIds.SpikedSavior_BG29_808_G:
				const spikedSaviorLoops = deadEntity.cardId === CardIds.SpikedSavior_BG29_808_G ? 2 : 1;
				for (let i = 0; i < multiplier; i++) {
					for (let j = 0; j < spikedSaviorLoops; j++) {
						const targetBoard = [...boardWithDeadEntity];
						for (const entity of targetBoard) {
							modifyHealth(entity, 1, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
							onStatsUpdate(entity, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
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
			[
				CardIds.Leapfrogger_LeapfrogginEnchantment_BG21_000e,
				CardIds.Leapfrogger_LeapfrogginEnchantment_BG21_000_Ge,
			].includes(cardId as CardIds)
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
	deadEntity: BoardEntity,
	sourceEntity: BgsPlayerEntity | BoardEntity,
	gameState: FullGameState,
): void => {
	const multiplier = deadEntity?.cardId === CardIds.SpiritRaptor_BG22_HERO_001_Buddy_G ? 2 : 1;
	for (let i = 0; i < multiplier; i++) {
		const target: BoardEntity = boardWithDeadEntity[boardWithDeadEntity.length - 1];
		if (!!target) {
			modifyHealth(target, 3, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
			target.taunt = true;
			onStatsUpdate(target, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
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
		const target: BoardEntity = boardWithDeadEntity[0];
		if (!!target) {
			modifyAttack(target, target.attack, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
			onStatsUpdate(target, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
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
	multiplier = 1,
): void => {
	multiplier = multiplier || 1;
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
		// Don't register power effect here, since it's already done in the random stats
		// spectator.registerPowerTarget(deadEntity, buffed, boardWithDeadEntity);
		// console.log('applyLeapFroggerEffect', stringifySimpleCard(deadEntity), stringifySimpleCard(buffed));
	}
};

const applyRecurringNightmareDeathrattleEffect = (
	boardWithDeadEntity: BoardEntity[],
	deadEntity: BoardEntity,
	isPremium: boolean,
	allCards: AllCardsService,
	spectator: Spectator,
	sharedState: SharedState,
	multiplier = 1,
): void => {
	multiplier = multiplier || 1;
	const target = pickRandom(
		boardWithDeadEntity
			.filter((e) => hasCorrectTribe(e, Race.UNDEAD, allCards))
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
			timing: sharedState.currentEntityId++,
		});
		spectator.registerPowerTarget(deadEntity, target, boardWithDeadEntity, null, null);
	}
};

export const applyMinionDeathEffect = (
	deadEntity: BoardEntity,
	deadEntityIndexFromRight: number,
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	// console.log('applying minion death effect', stringifySimpleCard(deadEntity, allCards));
	if (isCorrectTribe(gameState.allCards.getCard(deadEntity.cardId).races, Race.BEAST)) {
		applyScavengingHyenaEffect(boardWithDeadEntity, boardWithDeadEntityHero, gameState);
	}
	if (isCorrectTribe(gameState.allCards.getCard(deadEntity.cardId).races, Race.DEMON)) {
		applySoulJugglerEffect(boardWithDeadEntity, boardWithDeadEntityHero, otherBoard, otherBoardHero, gameState);
	}
	if (isCorrectTribe(gameState.allCards.getCard(deadEntity.cardId).races, Race.MECH)) {
		applyJunkbotEffect(boardWithDeadEntity, boardWithDeadEntityHero, gameState);
	}
	if (hasCorrectTribe(deadEntity, Race.MURLOC, gameState.allCards)) {
		removeOldMurkEyeAttack(boardWithDeadEntity, boardWithDeadEntityHero, gameState);
		removeOldMurkEyeAttack(otherBoard, otherBoardHero, gameState);
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
			modifyAttack(e, 1, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
			onStatsUpdate(e, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
		});

	applyRotHideGnollEffect(boardWithDeadEntity, boardWithDeadEntityHero, gameState);

	// Overkill
	if (deadEntity.health < 0 && deadEntity.lastAffectedByEntity?.attacking) {
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
				gameState.allCards,
				gameState.cardsData,
				gameState.sharedState,
				gameState.spectator,
				!deadEntity.friendly,
				true,
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
				gameState.allCards,
				gameState.cardsData,
				gameState.sharedState,
				gameState.spectator,
				!deadEntity.friendly,
				true,
			);
			otherBoard.splice(otherBoard.length - deadEntityIndexFromRight, 0, ...newEntities);
		} else if (deadEntity.lastAffectedByEntity.cardId === CardIds.SeabreakerGoliath_BGS_080) {
			const otherPirates = otherBoard
				.filter((entity) => isCorrectTribe(gameState.allCards.getCard(entity.cardId).races, Race.PIRATE))
				.filter((entity) => entity.entityId !== deadEntity.lastAffectedByEntity.entityId);
			otherPirates.forEach((pirate) => {
				modifyAttack(pirate, 2, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
				modifyHealth(pirate, 2, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
				onStatsUpdate(pirate, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
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
				.filter((entity) => isCorrectTribe(gameState.allCards.getCard(entity.cardId).races, Race.PIRATE))
				.filter((entity) => entity.entityId !== deadEntity.lastAffectedByEntity.entityId);
			otherPirates.forEach((pirate) => {
				modifyAttack(pirate, 4, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
				modifyHealth(pirate, 4, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
				onStatsUpdate(pirate, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
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
			modifyAttack(board[i], 2, board, boardWithDeadEntityHero, gameState);
			modifyHealth(board[i], 1, board, boardWithDeadEntityHero, gameState);
			onStatsUpdate(board[i], board, boardWithDeadEntityHero, gameState);
			gameState.spectator.registerPowerTarget(board[i], board[i], board, null, null);
		} else if (board[i].cardId === CardIds.ScavengingHyenaLegacy_TB_BaconUps_043) {
			modifyAttack(board[i], 4, board, boardWithDeadEntityHero, gameState);
			modifyHealth(board[i], 2, board, boardWithDeadEntityHero, gameState);
			onStatsUpdate(board[i], board, boardWithDeadEntityHero, gameState);
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
			modifyAttack(board[i], multiplier * 1, board, hero, gameState);
			modifyHealth(board[i], multiplier * 1, board, hero, gameState);
			onStatsUpdate(board[i], board, hero, gameState);
			gameState.spectator.registerPowerTarget(board[i], board[i], board, null, null);
		}
	}
};

const applyRotHideGnollEffect = (board: BoardEntity[], hero: BgsPlayerEntity, gameState: FullGameState): void => {
	for (let i = 0; i < board.length; i++) {
		if (board[i].cardId === CardIds.RotHideGnoll_BG25_013 || board[i].cardId === CardIds.RotHideGnoll_BG25_013_G) {
			const multiplier = board[i].cardId === CardIds.RotHideGnoll_BG25_013_G ? 2 : 1;
			modifyAttack(board[i], multiplier * 1, board, hero, gameState);
			onStatsUpdate(board[i], board, hero, gameState);
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

const applyJunkbotEffect = (board: BoardEntity[], hero: BgsPlayerEntity, gameState: FullGameState): void => {
	for (let i = 0; i < board.length; i++) {
		if (board[i].cardId === CardIds.Junkbot_GVG_106) {
			modifyAttack(board[i], 2, board, hero, gameState);
			modifyHealth(board[i], 2, board, hero, gameState);
			onStatsUpdate(board[i], board, hero, gameState);
			gameState.spectator.registerPowerTarget(board[i], board[i], board, null, null);
		} else if (board[i].cardId === CardIds.Junkbot_TB_BaconUps_046) {
			modifyAttack(board[i], 4, board, hero, gameState);
			modifyHealth(board[i], 4, board, hero, gameState);
			onStatsUpdate(board[i], board, hero, gameState);
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
	const neighbours = getNeighbours(board, null, deadEntityIndexFromRight);

	// TODO: if reactivated, properly apply buffs one by one, instead of all together
	neighbours.forEach((entity) => {
		modifyAttack(entity, 2 * qiraji.length + 4 * goldenQiraji.length, board, hero, gameState);
		modifyHealth(entity, 2 * qiraji.length + 4 * goldenQiraji.length, board, hero, gameState);
		onStatsUpdate(entity, board, hero, gameState);
	});
};

export const applyMonstrosity = (
	monstrosity: BoardEntity,
	deadEntities: readonly BoardEntity[],
	boardWithDeadEntities: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	for (const deadEntity of deadEntities) {
		modifyAttack(monstrosity, deadEntity.attack, boardWithDeadEntities, boardWithDeadEntityHero, gameState);
		if (monstrosity.cardId === CardIds.Monstrosity_BG20_HERO_282_Buddy_G) {
			modifyAttack(monstrosity, deadEntity.attack, boardWithDeadEntities, boardWithDeadEntityHero, gameState);
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
		.filter(
			(entity) =>
				cardsData.validDeathrattles.includes(entity.cardId) || isFish(entity) || isPilotedWhirlOTron(entity),
		)
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
		.filter((enchantment) => VALID_ENCHANTMENTS.includes(enchantment.cardId as CardIds));
	// Multiple fish
	const deadEntityRememberedDeathrattles =
		deadEntities
			.filter((e) => !!e.rememberedDeathrattles?.length)
			// If the fish has reborn, it will inherit its own Deathrattles, and we don't want that
			.filter((e) => e.entityId !== fish.rebornFromEntityId)
			.flatMap((e) => e.rememberedDeathrattles) ?? [];
	const newDeathrattles = [...validDeathrattles, ...validEnchantments, ...deadEntityRememberedDeathrattles];
	// Order is important - the DR are triggered in the ordered the minions have died
	if (isGolden(fish.cardId, allCards)) {
		// https://stackoverflow.com/questions/33305152/how-to-duplicate-elements-in-a-js-array
		const doubleDr = newDeathrattles.reduce((res, current) => res.concat([current, current]), []);
		fish.rememberedDeathrattles = [...(fish.rememberedDeathrattles || []), ...doubleDr];
	} else {
		fish.rememberedDeathrattles = [...(fish.rememberedDeathrattles || []), ...newDeathrattles];
	}
	if (fish.rememberedDeathrattles?.length) {
		fish.rememberedDeathrattles.sort((a, b) => a.timing - b.timing);
	}
	// console.debug(
	// 	'remembered',
	// 	fish.rememberedDeathrattles.map((d) => ({
	// 		cardId: d.cardId,
	// 		name: allCards.getCard(d.cardId)?.name,
	// 		// repeats: d.repeats,
	// 		timing: d.timing,
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
		modifyAttack(entity, -1, boardWithDeadEntity, hero, gameState);
		onStatsUpdate(entity, boardWithDeadEntity, hero, gameState);
	});
	goldenMurkeyes.forEach((entity) => {
		modifyAttack(entity, -2, boardWithDeadEntity, hero, gameState);
		onStatsUpdate(entity, boardWithDeadEntity, hero, gameState);
	});
};
