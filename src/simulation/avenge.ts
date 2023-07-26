import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';
import { pickRandom } from '../services/utils';
import {
	addCardsInHand,
	addStatsToBoard,
	afterStatsUpdate,
	getRandomAliveMinion,
	getRandomMinionWithHighestHealth,
	grantRandomStats,
	grantStatsToMinionsOfEachType,
	makeMinionGolden,
	modifyAttack,
	modifyHealth,
} from '../utils';
import { dealDamageToEnemy, getNeighbours, performEntitySpawns } from './attack';
import { spawnEntities } from './deathrattle-spawns';
import { SharedState } from './shared-state';
import { Spectator } from './spectator/spectator';

export const applyAvengeEffects = (
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
	const candidatesEntitiesSpawnedFromAvenge: BoardEntity[] = [];
	updateAvengeCounters(boardWithDeadEntity, boardWithDeadEntityHero);
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
			cardsData,
			sharedState,
			spectator,
			allCards,
		);
	}
	// console.log('updating dead entity avenge counter', boardWithDeadEntityHero.avengeCurrent, stringifySimpleCard(deadEntity, allCards));
	const heroAvenger = !!boardWithDeadEntityHero.avengeDefault && boardWithDeadEntityHero.avengeCurrent === 0;
	if (heroAvenger) {
		// console.log(
		// 	'Hero is an avenger',
		// 	boardWithDeadEntityHero.avengeCurrent,
		// 	boardWithDeadEntityHero.avengeDefault,
		// 	boardWithDeadEntityHero.heroPowerId,
		// );
		handleHeroAvenge(
			deadEntity,
			boardWithDeadEntity,
			boardWithDeadEntityHero,
			otherBoard,
			otherBoardHero,
			candidatesEntitiesSpawnedFromAvenge,
			cardsData,
			sharedState,
			spectator,
			allCards,
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
			cardsData,
			sharedState,
			spectator,
			allCards,
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
		allCards,
		cardsData,
		sharedState,
		spectator,
	);
};

const updateAvengeCounters = (board: readonly BoardEntity[], boardWithDeadEntityHero: BgsPlayerEntity) => {
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
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
	allCards: AllCardsService,
) => {
	// Don't forget to update the avenge data in cards-data
	switch (avenger.cardId) {
		case CardIds.BirdBuddy_BG21_002:
			addStatsToBoard(avenger, boardWithDeadEntity, 1, 1, allCards, spectator, 'BEAST');
			break;
		case CardIds.BirdBuddy_BG21_002_G:
			addStatsToBoard(avenger, boardWithDeadEntity, 2, 2, allCards, spectator, 'BEAST');
			break;
		case CardIds.BuddingGreenthumb_BG21_030:
		case CardIds.BuddingGreenthumb_BG21_030_G:
			const neighbours = getNeighbours(boardWithDeadEntity, avenger);
			neighbours.forEach((entity) => {
				modifyAttack(
					entity,
					avenger.cardId === CardIds.BuddingGreenthumb_BG21_030_G ? 4 : 2,
					boardWithDeadEntity,
					allCards,
				);
				modifyHealth(
					entity,
					avenger.cardId === CardIds.BuddingGreenthumb_BG21_030_G ? 2 : 1,
					boardWithDeadEntity,
					allCards,
				);
				afterStatsUpdate(entity, boardWithDeadEntity, allCards);
				spectator.registerPowerTarget(avenger, entity, boardWithDeadEntity);
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
			addStatsToBoard(
				avenger,
				boardWithDeadEntity,
				0,
				avenger.cardId === CardIds.StormpikeLieutenant_BG22_HERO_003_Buddy_G ? 2 : 1,
				allCards,
				spectator,
			);
			break;
		case CardIds.PalescaleCrocolisk_BG21_001:
			const target1 = grantRandomStats(avenger, boardWithDeadEntity, 6, 6, Race.BEAST, true, allCards, spectator);
			if (!!target1) {
				spectator.registerPowerTarget(avenger, target1, boardWithDeadEntity);
			}
			break;
		case CardIds.PalescaleCrocolisk_BG21_001_G:
			const target2 = grantRandomStats(
				avenger,
				boardWithDeadEntity,
				12,
				12,
				Race.BEAST,
				true,
				allCards,
				spectator,
			);
			if (!!target2) {
				spectator.registerPowerTarget(avenger, target2, boardWithDeadEntity);
			}
			break;
		case CardIds.ImpatientDoomsayer_BG21_007:
		case CardIds.ImpatientDoomsayer_BG21_007_G:
			const doomsayerCardsToAddQuantity = avenger.cardId === CardIds.ImpatientDoomsayer_BG21_007_G ? 2 : 1;
			const doomsayerCardsToAdd = [];
			for (let i = 0; i < doomsayerCardsToAddQuantity; i++) {
				doomsayerCardsToAdd.push(pickRandom(cardsData.demonSpawns));
			}
			addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, allCards, spectator, doomsayerCardsToAdd);
			break;
		case CardIds.PashmarTheVengeful_BG23_014:
		case CardIds.PashmarTheVengeful_BG23_014_G:
			addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, allCards, spectator, [null]);
			break;
		case CardIds.WitchwingNestmatron_BG21_038:
		case CardIds.WitchwingNestmatron_BG21_038_G:
			const nestmatronToAddQuantity = avenger.cardId === CardIds.WitchwingNestmatron_BG21_038_G ? 2 : 1;
			const nestmatronCardsToAdd = [];
			for (let i = 0; i < nestmatronToAddQuantity; i++) {
				nestmatronCardsToAdd.push(pickRandom(cardsData.brannEpicEggSpawns));
			}
			addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, allCards, spectator, nestmatronCardsToAdd);
			break;
		case CardIds.Thorncaller_BG20_105:
		case CardIds.Thorncaller_BG20_105_G:
			const thorncallerToAddQuantity = avenger.cardId === CardIds.Thorncaller_BG20_105_G ? 2 : 1;
			const thorncallerCardsToAdd = Array(thorncallerToAddQuantity).fill(CardIds.BloodGem);
			addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, allCards, spectator, thorncallerCardsToAdd);
			break;
		case CardIds.Sisefin_BG21_009:
		case CardIds.Sisefin_BG21_009_G:
			const poisonousIterations = avenger.cardId === CardIds.Sisefin_BG21_009_G ? 2 : 1;
			for (let i = 0; i < poisonousIterations; i++) {
				const validTargets = boardWithDeadEntity.filter((e) => !e.poisonous && !e.venomous);
				const murloc = getRandomAliveMinion(validTargets, Race.MURLOC, allCards);
				if (murloc) {
					murloc.venomous = true;
					spectator.registerPowerTarget(avenger, murloc, boardWithDeadEntity);
				}
			}
			break;
		case CardIds.ScrapScraper_BG26_148:
		case CardIds.ScrapScraper_BG26_148_G:
			const scraperToAddQuantity = avenger.cardId === CardIds.ScrapScraper_BG26_148_G ? 2 : 1;
			const scraperCardsToAdd = [];
			for (let i = 0; i < scraperToAddQuantity; i++) {
				scraperCardsToAdd.push(pickRandom(cardsData.scrapScraperSpawns));
			}
			addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, allCards, spectator, scraperCardsToAdd);
			break;
		case CardIds.MechanoTank_BG21_023:
			// This can be null if the avenge triggers when the last enemy minion dies as well
			const target = getRandomMinionWithHighestHealth(otherBoard);
			spectator.registerPowerTarget(avenger, target, otherBoard);
			dealDamageToEnemy(
				target,
				otherBoard,
				otherBoardHero,
				avenger,
				5,
				boardWithDeadEntity,
				boardWithDeadEntityHero,
				allCards,
				cardsData,
				sharedState,
				spectator,
			);
			break;
		case CardIds.MechanoTank_BG21_023_G:
			for (let i = 0; i < 2; i++) {
				const target = getRandomMinionWithHighestHealth(otherBoard);
				spectator.registerPowerTarget(avenger, target, otherBoard);
				dealDamageToEnemy(
					target,
					otherBoard,
					otherBoardHero,
					avenger,
					5,
					boardWithDeadEntity,
					boardWithDeadEntityHero,
					allCards,
					cardsData,
					sharedState,
					spectator,
				);
			}
			break;
		case CardIds.TonyTwoTusk_BG21_031:
			const nonGoldenMinions = boardWithDeadEntity
				.filter((e) => e.entityId !== avenger.entityId)
				.filter((e) => {
					const ref = allCards.getCard(e.cardId);
					return (
						!!ref.battlegroundsPremiumDbfId && !!allCards.getCardFromDbfId(ref.battlegroundsPremiumDbfId).id
					);
				});
			const pirate = getRandomAliveMinion(nonGoldenMinions, Race.PIRATE, allCards);
			if (pirate) {
				makeMinionGolden(pirate, avenger, boardWithDeadEntity, allCards, spectator);
			}
			break;
		case CardIds.TonyTwoTusk_BG21_031_G:
			for (let i = 0; i < 2; i++) {
				const nonGoldenMinions = boardWithDeadEntity.filter((e) => {
					const ref = allCards.getCard(e.cardId);
					return !!ref.battlegroundsPremiumDbfId;
				});
				const pirate = getRandomAliveMinion(nonGoldenMinions, Race.PIRATE, allCards);
				if (pirate) {
					makeMinionGolden(pirate, avenger, boardWithDeadEntity, allCards, spectator);
				}
			}
			break;
		case CardIds.GhoulOfTheFeast_BG25_002:
		case CardIds.GhoulOfTheFeast_BG25_002_G:
			const ghoulMultiplier = avenger.cardId === CardIds.GhoulOfTheFeast_BG25_002_G ? 2 : 1;
			grantStatsToMinionsOfEachType(avenger, boardWithDeadEntity, ghoulMultiplier * 3, 0, allCards, spectator);
			break;
		case CardIds.Bristlebach_BG26_157:
		case CardIds.Bristlebach_BG26_157_G:
			const bristlebachMultiplier = avenger.cardId === CardIds.Bristlebach_BG26_157_G ? 2 : 1;
			const bloodGemAttackBuff = 1 + (boardWithDeadEntityHero.globalInfo?.BloodGemAttackBonus ?? 0);
			const bloodGemHealthBuff = 1 + (boardWithDeadEntityHero.globalInfo?.BloodGemHealthBonus ?? 0);
			for (let i = 0; i < bristlebachMultiplier * 2; i++) {
				addStatsToBoard(
					avenger,
					boardWithDeadEntity,
					bloodGemAttackBuff,
					bloodGemHealthBuff,
					allCards,
					spectator,
					Race[Race.QUILBOAR],
				);
			}
			break;
		case CardIds.HungeringAbomination_BG25_014:
		case CardIds.HungeringAbomination_BG25_014_G:
			const abominationMultiplier = avenger.cardId === CardIds.HungeringAbomination_BG25_014_G ? 2 : 1;
			modifyAttack(avenger, abominationMultiplier * 1, boardWithDeadEntity, allCards);
			modifyHealth(avenger, abominationMultiplier * 1, boardWithDeadEntity, allCards);
			afterStatsUpdate(avenger, boardWithDeadEntity, allCards);
			spectator.registerPowerTarget(avenger, avenger, boardWithDeadEntity);
			break;
		case CardIds.ShadowyConstruct_BG25_HERO_103_Buddy:
		case CardIds.ShadowyConstruct_BG25_HERO_103_Buddy_G:
			const neighboursShadowy = getNeighbours(boardWithDeadEntity, null, deadEntityIndexFromRight);
			const multiplierShadowy = avenger.cardId === CardIds.ShadowyConstruct_BG25_HERO_103_Buddy_G ? 2 : 1;
			neighboursShadowy.forEach((neighbour) => {
				modifyAttack(neighbour, multiplierShadowy * 1, boardWithDeadEntity, allCards);
				modifyHealth(neighbour, multiplierShadowy * 1, boardWithDeadEntity, allCards);
				afterStatsUpdate(neighbour, boardWithDeadEntity, allCards);
				spectator.registerPowerTarget(avenger, neighbour, boardWithDeadEntity);
			});
			break;
		case CardIds.IceSickle:
			grantRandomStats(avenger, boardWithDeadEntityHero.hand, 3, 0, null, true, allCards, null);
			break;
		case CardIds.BoomSquad_BG27_Reward_502:
			const highestHealthMinion = [...otherBoard].sort((a, b) => b.health - a.health)[0];
			dealDamageToEnemy(
				highestHealthMinion,
				otherBoard,
				otherBoardHero,
				avenger,
				10,
				boardWithDeadEntity,
				boardWithDeadEntityHero,
				allCards,
				cardsData,
				sharedState,
				spectator,
			);
			spectator.registerPowerTarget(avenger, highestHealthMinion, otherBoard);
			break;
	}
	avenger.avengeCurrent = avenger.avengeDefault;
};

const handleHeroAvenge = (
	deadEntity: BoardEntity,
	boardWithDeadEntity: BoardEntity[],
	boardWithDeadEntityHero: BgsPlayerEntity,
	otherBoard: BoardEntity[],
	otherBoardHero: BgsPlayerEntity,
	candidatesEntitiesSpawnedFromAvenge: BoardEntity[],
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
	allCards: AllCardsService,
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
					allCards,
					cardsData,
					sharedState,
					spectator,
					deadEntity.friendly,
					false,
					false,
					false,
				),
			);
			break;
		case CardIds.VanndarStormpike_LeadTheStormpikes:
			boardWithDeadEntity
				.filter((entity) => !entity.definitelyDead && entity.health > 0)
				.forEach((entity) => {
					modifyHealth(entity, 1, boardWithDeadEntity, allCards);
					afterStatsUpdate(entity, boardWithDeadEntity, allCards);
					spectator.registerPowerTarget(boardWithDeadEntityHero, entity, boardWithDeadEntity);
				});
			break;
		case CardIds.Drekthar_LeadTheFrostwolves:
			boardWithDeadEntity.forEach((entity) => {
				modifyAttack(entity, 1, boardWithDeadEntity, allCards);
				afterStatsUpdate(entity, boardWithDeadEntity, allCards);
				spectator.registerPowerTarget(boardWithDeadEntityHero, entity, boardWithDeadEntity);
			});
			break;
	}
	boardWithDeadEntityHero.avengeCurrent = boardWithDeadEntityHero.avengeDefault;
};
