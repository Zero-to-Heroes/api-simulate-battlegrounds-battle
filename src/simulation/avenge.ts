import { CardIds, CardType, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { pickRandom } from '../services/utils';
import {
	addStatsToBoard,
	getRandomAliveMinion,
	getRandomMinionWithHighestHealth,
	grantRandomDivineShield,
	grantRandomStats,
	grantStatsToMinionsOfEachType,
	hasCorrectTribe,
	isMinionGolden,
	makeMinionGolden,
} from '../utils';
import { dealDamageToMinion, getNeighbours } from './attack';
import { playBloodGemsOn } from './blood-gems';
import { addCardsInHand } from './cards-in-hand';
import { spawnEntities } from './deathrattle-spawns';
import { FullGameState } from './internal-game-state';
import { performEntitySpawns } from './spawns';
import { modifyAttack, modifyHealth, onStatsUpdate } from './stats';

export const applyAvengeEffects = (
	deadEntity: BoardEntity,
	deadEntityIndexFromRight: number,
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
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
			otherBoard,
			otherBoardHero,
			gameState,
		);
	}
	// console.log('updating dead entity avenge counter', boardWithDeadEntityHero.avengeCurrent, stringifySimpleCard(deadEntity, allCards));
	const heroAvenger = !!boardWithDeadEntityHero.avengeDefault && boardWithDeadEntityHero.avengeCurrent <= 0;
	if (heroAvenger) {
		handleHeroAvenge(
			deadEntity,
			boardWithDeadEntity,
			boardWithDeadEntityHero,
			otherBoard,
			otherBoardHero,
			candidatesEntitiesSpawnedFromAvenge,
			gameState,
		);
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
};

export const updateAvengeCounters = (board: readonly BoardEntity[], boardWithDeadEntityHero: BgsPlayerEntity) => {
	for (const entity of board) {
		if (!!entity.avengeDefault) {
			entity.avengeCurrent -= 1;
		}
	}
	if (!!boardWithDeadEntityHero.avengeDefault) {
		boardWithDeadEntityHero.avengeCurrent -= 1;
	}

	for (const reward of boardWithDeadEntityHero.questRewardEntities) {
		if (!!reward.avengeDefault) {
			reward.avengeCurrent -= 1;
		}
	}
};

const handleAvenge = (
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	deadEntity: BoardEntity,
	deadEntityIndexFromRight: number,
	avenger: BoardEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	// Don't forget to update the avenge data in cards-data
	switch (avenger.cardId) {
		case CardIds.BirdBuddy_BG21_002:
			addStatsToBoard(avenger, boardWithDeadEntity, boardWithDeadEntityHero, 1, 1, gameState, 'BEAST');
			break;
		case CardIds.BirdBuddy_BG21_002_G:
			addStatsToBoard(avenger, boardWithDeadEntity, boardWithDeadEntityHero, 2, 2, gameState, 'BEAST');
			break;
		case CardIds.BuddingGreenthumb_BG21_030:
		case CardIds.BuddingGreenthumb_BG21_030_G:
			const neighbours = getNeighbours(boardWithDeadEntity, avenger);
			neighbours.forEach((entity) => {
				modifyAttack(
					entity,
					avenger.cardId === CardIds.BuddingGreenthumb_BG21_030_G ? 4 : 2,
					boardWithDeadEntity,
					boardWithDeadEntityHero,
					gameState,
				);
				modifyHealth(
					entity,
					avenger.cardId === CardIds.BuddingGreenthumb_BG21_030_G ? 2 : 1,
					boardWithDeadEntity,
					boardWithDeadEntityHero,
					gameState,
				);
				onStatsUpdate(entity, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
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
				nestmatronCardsToAdd.push(pickRandom(gameState.cardsData.brannEpicEggSpawns));
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
				const murloc = getRandomAliveMinion(validTargets, Race.MURLOC, gameState.allCards);
				if (murloc) {
					murloc.venomous = true;
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
			const pirate = getRandomAliveMinion(nonGoldenMinions, Race.PIRATE, gameState.allCards);
			if (pirate) {
				makeMinionGolden(pirate, avenger, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
			}
			break;
		case CardIds.TonyTwoTusk_BG21_031_G:
			for (let i = 0; i < 2; i++) {
				const nonGoldenMinions = boardWithDeadEntity.filter((e) => !isMinionGolden(e, gameState.allCards));
				const pirate = getRandomAliveMinion(nonGoldenMinions, Race.PIRATE, gameState.allCards);
				if (pirate) {
					makeMinionGolden(pirate, avenger, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
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
					if (hasCorrectTribe(entity, Race.QUILBOAR, gameState.allCards)) {
						playBloodGemsOn(entity, 1, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
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
			modifyAttack(avenger, abominationMultiplier * 1, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
			modifyHealth(avenger, abominationMultiplier * 1, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
			onStatsUpdate(avenger, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
			gameState.spectator.registerPowerTarget(
				avenger,
				avenger,
				boardWithDeadEntity,
				boardWithDeadEntityHero,
				otherBoardHero,
			);
			break;
		case CardIds.ShadowyConstruct_BG25_HERO_103_Buddy:
		case CardIds.ShadowyConstruct_BG25_HERO_103_Buddy_G:
			const neighboursShadowy = getNeighbours(boardWithDeadEntity, null, deadEntityIndexFromRight);
			const multiplierShadowy = avenger.cardId === CardIds.ShadowyConstruct_BG25_HERO_103_Buddy_G ? 2 : 1;
			neighboursShadowy.forEach((neighbour) => {
				modifyAttack(neighbour, multiplierShadowy * 1, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
				modifyHealth(neighbour, multiplierShadowy * 1, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
				onStatsUpdate(neighbour, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
				gameState.spectator.registerPowerTarget(
					avenger,
					neighbour,
					boardWithDeadEntity,
					boardWithDeadEntityHero,
					otherBoardHero,
				);
			});
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
			avenger.reborn = true;
			avenger.taunt = true;
			break;
		case CardIds.RelentlessMurghoul_BG27_010:
		case CardIds.RelentlessMurghoul_BG27_010_G:
			avenger.reborn = true;
			break;
		case CardIds.ChampionOfThePrimus_BG27_029:
		case CardIds.ChampionOfThePrimus_BG27_029_G:
			const championPrimusStat = avenger.cardId === CardIds.ChampionOfThePrimus_BG27_029_G ? 2 : 1;
			boardWithDeadEntityHero.globalInfo.UndeadAttackBonus += championPrimusStat;
			addStatsToBoard(
				avenger,
				boardWithDeadEntity,
				boardWithDeadEntityHero,
				championPrimusStat,
				0,
				gameState,
				Race[Race.UNDEAD],
			);
			break;
		case CardIds.PhaerixWrathOfTheSun_BG28_403:
		case CardIds.PhaerixWrathOfTheSun_BG28_403_G:
			const phaerixLoops = avenger.cardId === CardIds.PhaerixWrathOfTheSun_BG28_403_G ? 2 : 1;
			for (let i = 0; i < phaerixLoops; i++) {
				grantRandomDivineShield(avenger, boardWithDeadEntity, gameState.allCards, gameState.spectator);
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
				tumblingDisasterEntity.scriptDataNum1++;
			}
			break;
		case CardIds.CycleOfEnergy_BG28_Reward_504:
			addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, [null], gameState);
			break;
		case CardIds.StableAmalgamation_BG28_Reward_518:
			avenger.scriptDataNum1++;
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
	}
	avenger.avengeCurrent += avenger.avengeDefault;
};

const handleHeroAvenge = (
	deadEntity: BoardEntity,
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	candidatesEntitiesSpawnedFromAvenge: BoardEntity[],
	gameState: FullGameState,
) => {
	// https://twitter.com/LoewenMitchell/status/1491879869457879040
	// Not affected by Khadgar
	switch (boardWithDeadEntityHero?.heroPowerId) {
		case CardIds.Onyxia_Broodmother:
			candidatesEntitiesSpawnedFromAvenge.push(
				...spawnEntities(
					CardIds.Onyxia_OnyxianWhelpToken,
					1,
					boardWithDeadEntity,
					boardWithDeadEntityHero,
					otherBoard,
					otherBoardHero,
					gameState.allCards,
					gameState.cardsData,
					gameState.sharedState,
					gameState.spectator,
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
					modifyHealth(entity, 1, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
					onStatsUpdate(entity, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
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
				modifyAttack(entity, 1, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
				onStatsUpdate(entity, boardWithDeadEntity, boardWithDeadEntityHero, gameState);
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
	boardWithDeadEntityHero.avengeCurrent += boardWithDeadEntityHero.avengeDefault;
};
