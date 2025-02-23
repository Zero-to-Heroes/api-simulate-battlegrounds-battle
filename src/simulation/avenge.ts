import { CardIds, CardType, GameTag, Race } from '@firestone-hs/reference-data';
import { BgsHeroPower, BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { hasAvenge } from '../cards/card.interface';
import { cardMappings } from '../cards/impl/_card-mappings';
import { grantRandomDivineShield } from '../keywords/divine-shield';
import { updateReborn } from '../keywords/reborn';
import { updateTaunt } from '../keywords/taunt';
import { updateVenomous } from '../keywords/venomous';
import { pickRandom } from '../services/utils';
import { isValidDeathrattleEnchantment } from '../simulate-bgs-battle';
import {
	addStatsToBoard,
	getRandomAliveMinion,
	getRandomMinionWithHighestHealth,
	grantRandomStats,
	grantStatsToMinionsOfEachType,
	hasCorrectTribe,
	hasMechanic,
} from '../utils';
import { dealDamageToMinion, getNeighbours } from './attack';
import { playBloodGemsOn } from './blood-gems';
import { addCardsInHand } from './cards-in-hand';
import { spawnEntities } from './deathrattle-spawns';
import { FullGameState } from './internal-game-state';
import { performEntitySpawns } from './spawns';
import { modifyStats } from './stats';
import { isMinionGolden, makeMinionGolden } from './utils/golden';

export const applyAvengeEffects = (
	deadEntity: BoardEntity,
	deadEntityIndexFromRight: number,
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
	entitiesSpawnedFromMinionDeath: BoardEntity[],
): void => {
	const candidatesEntitiesSpawnedFromAvenge: BoardEntity[] = [];
	// updateAvengeCounters(boardWithDeadEntity, boardWithDeadEntityHero);
	const avengers = boardWithDeadEntity
		.filter((e) => !!e.avengeDefault && e.avengeCurrent <= 0)
		// Get Tony to be processed first, because of the "when turned golden, the minion ignores the death for the avenge counter"
		// behavior
		.sort((a, b) => {
			if (a.cardId === CardIds.TonyTwoTusk_BG21_031 || a.cardId === CardIds.TonyTwoTusk_BG21_031_G) {
				return -1;
			}
			if (b.cardId === CardIds.TonyTwoTusk_BG21_031 || b.cardId === CardIds.TonyTwoTusk_BG21_031_G) {
				return 1;
			}
			return 0;
		});
	for (const avenger of avengers) {
		handleAvenge(
			boardWithDeadEntity,
			boardWithDeadEntityHero,
			deadEntity,
			deadEntityIndexFromRight,
			avenger,
			candidatesEntitiesSpawnedFromAvenge,
			otherBoard,
			otherBoardHero,
			gameState,
		);
	}
	// console.log('updating dead entity avenge counter', boardWithDeadEntityHero.avengeCurrent, stringifySimpleCard(deadEntity, allCards));
	for (const heroPower of boardWithDeadEntityHero.heroPowers) {
		const heroAvenger = !!heroPower.avengeDefault && heroPower.avengeCurrent <= 0;
		if (heroAvenger) {
			handleHeroAvenge(
				deadEntity,
				heroPower,
				boardWithDeadEntity,
				boardWithDeadEntityHero,
				otherBoard,
				otherBoardHero,
				candidatesEntitiesSpawnedFromAvenge,
				gameState,
			);
		}
	}

	const questRewardAvengers = boardWithDeadEntityHero.questRewardEntities.filter(
		(e) => !!e.avengeDefault && e.avengeCurrent <= 0,
	);
	for (const avenger of questRewardAvengers) {
		handleAvenge(
			boardWithDeadEntity,
			boardWithDeadEntityHero,
			deadEntity,
			deadEntityIndexFromRight,
			avenger as BoardEntity,
			candidatesEntitiesSpawnedFromAvenge,
			otherBoard,
			otherBoardHero,
			gameState,
		);
	}

	const trinketAvengers = boardWithDeadEntityHero.trinkets.filter((e) => !!e.avengeDefault && e.avengeCurrent <= 0);
	for (const avenger of trinketAvengers) {
		handleAvenge(
			boardWithDeadEntity,
			boardWithDeadEntityHero,
			deadEntity,
			deadEntityIndexFromRight,
			avenger as BoardEntity,
			candidatesEntitiesSpawnedFromAvenge,
			otherBoard,
			otherBoardHero,
			gameState,
		);
	}

	performEntitySpawns(
		candidatesEntitiesSpawnedFromAvenge,
		boardWithDeadEntity,
		boardWithDeadEntityHero,
		deadEntity,
		deadEntityIndexFromRight,
		otherBoard,
		otherBoardHero,
		gameState,
	);

	// Not an avenge, but with Avenge timing
	const hasDeathrattle =
		hasMechanic(gameState.allCards.getCard(deadEntity.cardId), GameTag[GameTag.DEATHRATTLE]) ||
		deadEntity.enchantments.some((e) => isValidDeathrattleEnchantment(e.cardId));
	if (hasDeathrattle) {
		// These are apparently processed after Reborn is triggered
		// http://replays.firestoneapp.com/?reviewId=5db9a191-ae9b-43a5-a072-0d460631d7a9&turn=23&action=12
		// UPDATE 2024-06-24: Multiple counterexamples of this, so I'm not sure exactly what is the right approach
		// I'm implementing the one that makes more sense to me; triggering after reborn is just too different
		// from what happens usually
		// However, we want to trigger it after all the spawns have been processed, so more or less an "avenge" timing?
		// Maybe even after that?
		// Update 2024-06-27 29.6.2: timing should stay the same
		boardWithDeadEntity
			.filter((e) => e.cardId === CardIds.GhoulAcabra_BG29_863 || e.cardId === CardIds.GhoulAcabra_BG29_863_G)
			.forEach((ghoul) => {
				const buff = ghoul.cardId === CardIds.GhoulAcabra_BG29_863_G ? 2 : 1;
				addStatsToBoard(ghoul, boardWithDeadEntity, boardWithDeadEntityHero, 2 * buff, 2 * buff, gameState);
			});
	}
};

export const updateAvengeCounters = (board: readonly BoardEntity[], boardWithDeadEntityHero: BgsPlayerEntity) => {
	for (const entity of board) {
		if (!!entity.avengeDefault) {
			entity.avengeCurrent -= 1;
		}
	}
	for (const heroPower of boardWithDeadEntityHero.heroPowers) {
		if (!!heroPower.avengeDefault) {
			heroPower.avengeCurrent -= 1;
		}
	}

	for (const reward of boardWithDeadEntityHero.questRewardEntities) {
		if (!!reward.avengeDefault) {
			reward.avengeCurrent -= 1;
		}
	}

	for (const trinket of boardWithDeadEntityHero.trinkets) {
		if (!!trinket.avengeDefault) {
			trinket.avengeCurrent -= 1;
		}
	}
};

const handleAvenge = (
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	deadEntity: BoardEntity,
	deadEntityIndexFromRight: number,
	avenger: BoardEntity,
	candidatesEntitiesSpawnedFromAvenge: BoardEntity[],
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	const avengeImpl = cardMappings[avenger.cardId];
	if (hasAvenge(avengeImpl)) {
		const newSpawns = avengeImpl.avenge(avenger, {
			board: boardWithDeadEntity,
			hero: boardWithDeadEntityHero,
			otherBoard: otherBoard,
			otherHero: otherBoardHero,
			gameState,
		});
		if (Array.isArray(newSpawns) && newSpawns?.length) {
			candidatesEntitiesSpawnedFromAvenge.push(...newSpawns);
		}
	} else {
		// Don't forget to update the avenge data in cards-data
		switch (avenger.cardId) {
			case CardIds.BuddingGreenthumb_BG21_030:
			case CardIds.BuddingGreenthumb_BG21_030_G:
				const neighbours = getNeighbours(boardWithDeadEntity, avenger);
				neighbours.forEach((entity) => {
					modifyStats(
						entity,
						avenger.cardId === CardIds.BuddingGreenthumb_BG21_030_G ? 4 : 2,
						avenger.cardId === CardIds.BuddingGreenthumb_BG21_030_G ? 2 : 1,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						gameState,
					);
					gameState.spectator.registerPowerTarget(
						avenger,
						entity,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoardHero,
					);
				});
				break;
			// case CardIds.FrostwolfLieutenant:
			// case CardIds.FrostwolfLieutenantBattlegrounds:
			// 	addStatsToBoard(
			// 		avenger,
			// 		boardWithDeadEntity,
			// 		avenger.cardId === CardIds.FrostwolfLieutenantBattlegrounds ? 2 : 1,
			// 		0,
			// 		allCards,
			// 		spectator,
			// 	);
			// 	break;
			case CardIds.StormpikeLieutenant_BG22_HERO_003_Buddy:
			case CardIds.StormpikeLieutenant_BG22_HERO_003_Buddy_G:
				// Only for Tavern
				// addStatsToBoard(
				// 	avenger,
				// 	boardWithDeadEntity,
				// 	0,
				// 	avenger.cardId === CardIds.StormpikeLieutenant_BG22_HERO_003_Buddy_G ? 2 : 1,
				// 	gameState.allCards,
				// 	gameState.spectator,
				// );
				break;
			case CardIds.PalescaleCrocolisk_BG21_001:
				const target1 = grantRandomStats(
					avenger,
					boardWithDeadEntity,
					boardWithDeadEntityHero,
					6,
					6,
					Race.BEAST,
					true,
					gameState,
				);
				if (!!target1) {
					gameState.spectator.registerPowerTarget(
						avenger,
						target1,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoardHero,
					);
				}
				break;
			case CardIds.PalescaleCrocolisk_BG21_001_G:
				const target2 = grantRandomStats(
					avenger,
					boardWithDeadEntity,
					boardWithDeadEntityHero,
					12,
					12,
					Race.BEAST,
					true,
					gameState,
				);
				if (!!target2) {
					gameState.spectator.registerPowerTarget(
						avenger,
						target2,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoardHero,
					);
				}
				break;
			case CardIds.ImpatientDoomsayer_BG21_007:
			case CardIds.ImpatientDoomsayer_BG21_007_G:
				const doomsayerCardsToAddQuantity = avenger.cardId === CardIds.ImpatientDoomsayer_BG21_007_G ? 2 : 1;
				const doomsayerCardsToAdd = [];
				for (let i = 0; i < doomsayerCardsToAddQuantity; i++) {
					doomsayerCardsToAdd.push(pickRandom(gameState.cardsData.demonSpawns));
				}
				addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, doomsayerCardsToAdd, gameState);
				break;
			case CardIds.PashmarTheVengeful_BG23_014:
			case CardIds.PashmarTheVengeful_BG23_014_G:
				addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, [null], gameState);
				break;
			case CardIds.TremblingTrolley_BG28_967:
			case CardIds.TremblingTrolley_BG28_967_G:
				addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, [null], gameState);
				break;
			case CardIds.WitchwingNestmatron_BG21_038:
			case CardIds.WitchwingNestmatron_BG21_038_G:
				const nestmatronToAddQuantity = avenger.cardId === CardIds.WitchwingNestmatron_BG21_038_G ? 2 : 1;
				const nestmatronCardsToAdd = [];
				for (let i = 0; i < nestmatronToAddQuantity; i++) {
					nestmatronCardsToAdd.push(pickRandom(gameState.cardsData.battlecryMinions));
				}
				addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, nestmatronCardsToAdd, gameState);
				break;
			case CardIds.Thorncaller_BG20_105:
			case CardIds.Thorncaller_BG20_105_G:
				const thorncallerToAddQuantity = avenger.cardId === CardIds.Thorncaller_BG20_105_G ? 2 : 1;
				const thorncallerCardsToAdd = Array(thorncallerToAddQuantity).fill(CardIds.BloodGem);
				addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, thorncallerCardsToAdd, gameState);
				break;
			case CardIds.Sisefin_BG21_009:
			case CardIds.Sisefin_BG21_009_G:
				const poisonousIterations = avenger.cardId === CardIds.Sisefin_BG21_009_G ? 2 : 1;
				for (let i = 0; i < poisonousIterations; i++) {
					const validTargets = boardWithDeadEntity.filter((e) => !e.poisonous && !e.venomous);
					const murloc = getRandomAliveMinion(validTargets, boardWithDeadEntityHero, Race.MURLOC, gameState);
					if (murloc) {
						updateVenomous(
							murloc,
							true,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoardHero,
							gameState,
						);
						gameState.spectator.registerPowerTarget(
							avenger,
							murloc,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoardHero,
						);
					}
				}
				break;
			case CardIds.MechanoTank_BG21_023:
				// This can be null if the avenge triggers when the last enemy minion dies as well
				const target = getRandomMinionWithHighestHealth(otherBoard);
				gameState.spectator.registerPowerTarget(
					avenger,
					target,
					otherBoard,
					boardWithDeadEntityHero,
					otherBoardHero,
				);
				dealDamageToMinion(
					target,
					otherBoard,
					otherBoardHero,
					avenger,
					5,
					boardWithDeadEntity,
					boardWithDeadEntityHero,
					gameState,
				);
				break;
			case CardIds.MechanoTank_BG21_023_G:
				for (let i = 0; i < 2; i++) {
					const target = getRandomMinionWithHighestHealth(otherBoard);
					gameState.spectator.registerPowerTarget(
						avenger,
						target,
						otherBoard,
						boardWithDeadEntityHero,
						otherBoardHero,
					);
					dealDamageToMinion(
						target,
						otherBoard,
						otherBoardHero,
						avenger,
						5,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						gameState,
					);
				}
				break;
			case CardIds.TonyTwoTusk_BG21_031:
				const nonGoldenMinions = boardWithDeadEntity
					.filter((e) => e.entityId !== avenger.entityId)
					.filter((e) => {
						const ref = gameState.allCards.getCard(e.cardId);
						return (
							!!ref.battlegroundsPremiumDbfId &&
							!!gameState.allCards.getCardFromDbfId(ref.battlegroundsPremiumDbfId).id
						);
					});
				const pirate = getRandomAliveMinion(nonGoldenMinions, boardWithDeadEntityHero, Race.PIRATE, gameState);
				if (pirate) {
					makeMinionGolden(
						pirate,
						avenger,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						gameState,
					);
				}
				break;
			case CardIds.TonyTwoTusk_BG21_031_G:
				for (let i = 0; i < 2; i++) {
					const nonGoldenMinions = boardWithDeadEntity.filter((e) => !isMinionGolden(e, gameState.allCards));
					const pirate = getRandomAliveMinion(
						nonGoldenMinions,
						boardWithDeadEntityHero,
						Race.PIRATE,
						gameState,
					);
					if (pirate) {
						makeMinionGolden(
							pirate,
							avenger,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoard,
							otherBoardHero,
							gameState,
						);
					}
				}
				break;
			case CardIds.GhoulOfTheFeast_BG25_002:
			case CardIds.GhoulOfTheFeast_BG25_002_G:
				const ghoulMultiplier = avenger.cardId === CardIds.GhoulOfTheFeast_BG25_002_G ? 2 : 1;
				grantStatsToMinionsOfEachType(
					avenger,
					boardWithDeadEntity,
					boardWithDeadEntityHero,
					ghoulMultiplier * 3,
					0,
					gameState,
				);
				break;
			case CardIds.Bristlebach_BG26_157:
			case CardIds.Bristlebach_BG26_157_G:
				const bristlebachMultiplier = avenger.cardId === CardIds.Bristlebach_BG26_157_G ? 4 : 2;
				for (let i = 0; i < bristlebachMultiplier; i++) {
					for (const entity of boardWithDeadEntity) {
						if (
							hasCorrectTribe(
								entity,
								boardWithDeadEntityHero,
								Race.QUILBOAR,
								gameState.anomalies,
								gameState.allCards,
							)
						) {
							playBloodGemsOn(
								avenger,
								entity,
								1,
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								gameState,
							);
							gameState.spectator.registerPowerTarget(
								avenger,
								entity,
								boardWithDeadEntity,
								boardWithDeadEntityHero,
								otherBoardHero,
							);
						}
					}
				}
				break;
			case CardIds.HungeringAbomination_BG25_014:
			case CardIds.HungeringAbomination_BG25_014_G:
				const abominationMultiplier = avenger.cardId === CardIds.HungeringAbomination_BG25_014_G ? 2 : 1;
				modifyStats(
					avenger,
					abominationMultiplier * 1,
					abominationMultiplier * 2,
					boardWithDeadEntity,
					boardWithDeadEntityHero,
					gameState,
				);
				gameState.spectator.registerPowerTarget(
					avenger,
					avenger,
					boardWithDeadEntity,
					boardWithDeadEntityHero,
					otherBoardHero,
				);
				break;
			case CardIds.IceSickle:
				grantRandomStats(
					avenger,
					boardWithDeadEntityHero.hand.filter(
						(e) => gameState.allCards.getCard(e.cardId).type?.toUpperCase() === CardType[CardType.MINION],
					),
					boardWithDeadEntityHero,
					4,
					0,
					null,
					true,
					gameState,
				);
				break;
			case CardIds.BoomSquad_BG27_Reward_502:
				const highestHealthMinion = [...otherBoard].sort((a, b) => b.health - a.health)[0];
				dealDamageToMinion(
					highestHealthMinion,
					otherBoard,
					otherBoardHero,
					avenger,
					10,
					boardWithDeadEntity,
					boardWithDeadEntityHero,
					gameState,
				);
				gameState.spectator.registerPowerTarget(
					avenger,
					highestHealthMinion,
					otherBoard,
					boardWithDeadEntityHero,
					otherBoardHero,
				);
				break;
			case CardIds.RelentlessSentry_BG25_003:
			case CardIds.RelentlessSentry_BG25_003_G:
				updateReborn(avenger, true, boardWithDeadEntity, boardWithDeadEntityHero, otherBoardHero, gameState);
				updateTaunt(avenger, true, boardWithDeadEntity, boardWithDeadEntityHero, otherBoardHero, gameState);
				break;
			case CardIds.RelentlessMurghoul_BG27_010:
			case CardIds.RelentlessMurghoul_BG27_010_G:
				updateReborn(avenger, true, boardWithDeadEntity, boardWithDeadEntityHero, otherBoardHero, gameState);
				updateTaunt(avenger, true, boardWithDeadEntity, boardWithDeadEntityHero, otherBoardHero, gameState);
				break;
			case CardIds.PhaerixWrathOfTheSun_BG28_403:
			case CardIds.PhaerixWrathOfTheSun_BG28_403_G:
				const phaerixLoops = avenger.cardId === CardIds.PhaerixWrathOfTheSun_BG28_403_G ? 2 : 1;
				for (let i = 0; i < phaerixLoops; i++) {
					grantRandomDivineShield(
						avenger,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoardHero,
						gameState,
					);
				}
				break;
			case CardIds.AugmentedLaborer_BG28_740:
			case CardIds.AugmentedLaborer_BG28_740_G:
				const AugmentedLaborerLoops = avenger.cardId === CardIds.AugmentedLaborer_BG28_740_G ? 2 : 1;
				for (let i = 0; i < AugmentedLaborerLoops; i++) {
					addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, [null], gameState);
				}
				break;
			case CardIds.TumblingDisaster_BG28_Reward_505:
				const tumblingDisasterEntity = boardWithDeadEntityHero.questRewardEntities?.find(
					(e) => e.cardId === CardIds.TumblingDisaster_BG28_Reward_505,
				);
				if (tumblingDisasterEntity) {
					tumblingDisasterEntity.scriptDataNum1 = (tumblingDisasterEntity.scriptDataNum1 ?? 0) + 1;
				}
				break;
			case CardIds.CycleOfEnergy_BG28_Reward_504:
				addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, [null], gameState);
				break;
			case CardIds.StableAmalgamation_BG28_Reward_518:
				avenger.scriptDataNum1 = (avenger.scriptDataNum1 ?? 0) + 1;
				break;
			case CardIds.MurglMkIi_BG29_991:
			case CardIds.MurglMkIi_BG29_991_G:
				const murglMkStats = avenger.cardId === CardIds.MurglMkIi_BG29_991_G ? 2 : 1;
				addStatsToBoard(
					avenger,
					boardWithDeadEntity,
					boardWithDeadEntityHero,
					murglMkStats,
					murglMkStats,
					gameState,
				);
				// Don't use utility methods, as we don't want triggers to proc
				for (const e of boardWithDeadEntityHero.hand ?? []) {
					e.attack += murglMkStats;
					e.health += murglMkStats;
					e.maxHealth += murglMkStats;
				}
				break;
			case CardIds.FridgeMagnet_BG30_MagicItem_545:
				const randomMagnetic = gameState.cardsData.getRandomMechToMagnetize(boardWithDeadEntityHero.tavernTier);
				addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, [randomMagnetic], gameState);
				break;
			case CardIds.QuilligraphySet_BG30_MagicItem_410:
				boardWithDeadEntityHero.globalInfo.BloodGemHealthBonus += 1;
				break;
			case CardIds.QuilligraphySet_QuilligraphySetToken_BG30_MagicItem_410t2:
				boardWithDeadEntityHero.globalInfo.BloodGemAttackBonus += 1;
				boardWithDeadEntityHero.globalInfo.BloodGemHealthBonus += 1;
				break;
			case CardIds.GilneanThornedRose_BG30_MagicItem_864:
				addStatsToBoard(avenger, boardWithDeadEntity, boardWithDeadEntityHero, 3, 3, gameState);
				for (const minion of boardWithDeadEntity) {
					dealDamageToMinion(
						minion,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						avenger,
						1,
						otherBoard,
						otherBoardHero,
						gameState,
					);
					gameState.spectator.registerPowerTarget(
						avenger,
						minion,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoardHero,
					);
				}
				break;
			case CardIds.StaffOfTheScourge_BG30_MagicItem_437:
				if (boardWithDeadEntity.length > 0) {
					const target = pickRandom(boardWithDeadEntity.filter((e) => !e.reborn));
					if (!!target) {
						updateReborn(
							target,
							true,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoardHero,
							gameState,
						);
						gameState.spectator.registerPowerTarget(
							avenger,
							target,
							boardWithDeadEntity,
							boardWithDeadEntityHero,
							otherBoardHero,
						);
					}
				}
				break;
			case CardIds.BleedingHeart_BG30_MagicItem_713:
				const randomUndead = gameState.cardsData.getRandomMinionForTribe(
					Race.UNDEAD,
					boardWithDeadEntityHero.tavernTier,
				);
				candidatesEntitiesSpawnedFromAvenge.push(
					...spawnEntities(
						randomUndead,
						1,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoard,
						otherBoardHero,
						gameState,
						deadEntity.friendly,
						false,
						false,
						false,
					),
				);
				addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, [randomUndead], gameState);
				break;
		}
	}
	avenger.avengeCurrent += avenger.avengeDefault;
};

const handleHeroAvenge = (
	deadEntity: BoardEntity,
	heroPower: BgsHeroPower,
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	candidatesEntitiesSpawnedFromAvenge: BoardEntity[],
	gameState: FullGameState,
) => {
	// https://twitter.com/LoewenMitchell/status/1491879869457879040
	// Not affected by Khadgar
	switch (heroPower.cardId) {
		case CardIds.Onyxia_Broodmother:
			candidatesEntitiesSpawnedFromAvenge.push(
				...spawnEntities(
					CardIds.Onyxia_OnyxianWhelpToken,
					1,
					boardWithDeadEntity,
					boardWithDeadEntityHero,
					otherBoard,
					otherBoardHero,
					gameState,
					deadEntity.friendly,
					false,
					false,
					false,
				),
			);
			break;
		case CardIds.VanndarStormpike_LeadTheStormpikes:
			boardWithDeadEntity
				// .filter((entity) => !entity.definitelyDead && entity.health > 0)
				.forEach((entity) => {
					modifyStats(entity, 0, 1, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
					gameState.spectator.registerPowerTarget(
						boardWithDeadEntityHero,
						entity,
						boardWithDeadEntity,
						boardWithDeadEntityHero,
						otherBoardHero,
					);
				});
			break;
		case CardIds.Drekthar_LeadTheFrostwolves:
			boardWithDeadEntity.forEach((entity) => {
				modifyStats(entity, 1, 0, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
				gameState.spectator.registerPowerTarget(
					boardWithDeadEntityHero,
					entity,
					boardWithDeadEntity,
					boardWithDeadEntityHero,
					otherBoardHero,
				);
			});
			break;
	}
	heroPower.avengeCurrent += heroPower.avengeDefault;
};

export interface AvengeInput {
	readonly board: BoardEntity[];
	readonly hero: BgsPlayerEntity;
	readonly otherBoard: BoardEntity[];
	readonly otherHero: BgsPlayerEntity;
	readonly gameState: FullGameState;
}
