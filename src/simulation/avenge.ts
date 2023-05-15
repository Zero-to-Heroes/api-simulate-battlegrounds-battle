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
		.filter((e) => !!e.avengeDefault && e.avengeCurrent === 0)
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
		case CardIds.BirdBuddy:
			addStatsToBoard(avenger, boardWithDeadEntity, 1, 1, allCards, spectator, 'BEAST');
			break;
		case CardIds.BirdBuddyBattlegrounds:
			addStatsToBoard(avenger, boardWithDeadEntity, 2, 2, allCards, spectator, 'BEAST');
			break;
		case CardIds.BuddingGreenthumb:
		case CardIds.BuddingGreenthumbBattlegrounds:
			const neighbours = getNeighbours(boardWithDeadEntity, avenger);
			neighbours.forEach((entity) => {
				modifyAttack(
					entity,
					avenger.cardId === CardIds.BuddingGreenthumbBattlegrounds ? 4 : 2,
					boardWithDeadEntity,
					allCards,
				);
				modifyHealth(
					entity,
					avenger.cardId === CardIds.BuddingGreenthumbBattlegrounds ? 2 : 1,
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
		case CardIds.StormpikeLieutenant:
		case CardIds.StormpikeLieutenantBattlegrounds:
			addStatsToBoard(
				avenger,
				boardWithDeadEntity,
				0,
				avenger.cardId === CardIds.StormpikeLieutenantBattlegrounds ? 2 : 1,
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
		case CardIds.ImpatientDoomsayer:
		case CardIds.ImpatientDoomsayerBattlegrounds:
			const doomsayerCardsToAddQuantity = avenger.cardId === CardIds.ImpatientDoomsayerBattlegrounds ? 2 : 1;
			const doomsayerCardsToAdd = [];
			for (let i = 0; i < doomsayerCardsToAddQuantity; i++) {
				doomsayerCardsToAdd.push(pickRandom(cardsData.demonSpawns));
			}
			addCardsInHand(boardWithDeadEntityHero, boardWithDeadEntity, allCards, spectator, doomsayerCardsToAdd);
			break;
		case CardIds.PashmarTheVengeful:
		case CardIds.PashmarTheVengefulBattlegrounds:
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
		case CardIds.Thorncaller:
		case CardIds.ThorncallerBattlegrounds:
			const thorncallerToAddQuantity = avenger.cardId === CardIds.ThorncallerBattlegrounds ? 2 : 1;
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
		case CardIds.ScrapScraper:
		case CardIds.ScrapScraperBattlegrounds:
			const scraperToAddQuantity = avenger.cardId === CardIds.ScrapScraperBattlegrounds ? 2 : 1;
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
		case CardIds.GhoulOfTheFeast:
		case CardIds.GhoulOfTheFeastBattlegrounds:
			const ghoulMultiplier = avenger.cardId === CardIds.GhoulOfTheFeastBattlegrounds ? 2 : 1;
			grantStatsToMinionsOfEachType(avenger, boardWithDeadEntity, ghoulMultiplier * 3, 0, allCards, spectator);
			break;
		case CardIds.Bristlebach:
		case CardIds.BristlebachBattlegrounds:
			const bristlebachMultiplier = avenger.cardId === CardIds.BristlebachBattlegrounds ? 2 : 1;
			// const currentBloodGemBuff
			// TODO: use current blood gem buff values
			for (let i = 0; i < bristlebachMultiplier * 2; i++) {
				addStatsToBoard(avenger, boardWithDeadEntity, 1, 1, allCards, spectator, Race[Race.QUILBOAR]);
			}
			break;
		case CardIds.HungeringAbomination:
		case CardIds.HungeringAbominationBattlegrounds:
			const abominationMultiplier = avenger.cardId === CardIds.HungeringAbominationBattlegrounds ? 2 : 1;
			modifyAttack(avenger, abominationMultiplier * 1, boardWithDeadEntity, allCards);
			modifyHealth(avenger, abominationMultiplier * 1, boardWithDeadEntity, allCards);
			afterStatsUpdate(avenger, boardWithDeadEntity, allCards);
			spectator.registerPowerTarget(avenger, avenger, boardWithDeadEntity);
			break;
		case CardIds.ShadowyConstruct:
		case CardIds.ShadowyConstructBattlegrounds:
			const neighboursShadowy = getNeighbours(boardWithDeadEntity, null, deadEntityIndexFromRight);
			const multiplierShadowy = avenger.cardId === CardIds.ShadowyConstructBattlegrounds ? 2 : 1;
			neighboursShadowy.forEach((neighbour) => {
				modifyAttack(neighbour, multiplierShadowy * 1, boardWithDeadEntity, allCards);
				modifyHealth(neighbour, multiplierShadowy * 1, boardWithDeadEntity, allCards);
				afterStatsUpdate(neighbour, boardWithDeadEntity, allCards);
				spectator.registerPowerTarget(avenger, neighbour, boardWithDeadEntity);
			});
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
