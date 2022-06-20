import { AllCardsService, CardIds, Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';
import {
	addCardsInHand,
	addStatsToBoard,
	afterStatsUpdate,
	getRandomAliveMinion,
	getRandomMinionWithHighestHealth,
	grantRandomStats,
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
			if (a.cardId === CardIds.TonyTwoTusk || a.cardId === CardIds.TonyTwoTuskBattlegrounds) {
				return -1;
			}
			if (b.cardId === CardIds.TonyTwoTusk || b.cardId === CardIds.TonyTwoTuskBattlegrounds) {
				return 1;
			}
			return 0;
		});
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
				modifyAttack(entity, avenger.cardId === CardIds.BuddingGreenthumbBattlegrounds ? 4 : 2, boardWithDeadEntity, allCards);
				modifyHealth(entity, avenger.cardId === CardIds.BuddingGreenthumbBattlegrounds ? 2 : 1, boardWithDeadEntity, allCards);
				afterStatsUpdate(entity, boardWithDeadEntity, allCards);
				spectator.registerPowerTarget(avenger, entity, boardWithDeadEntity);
			});
			break;
		case CardIds.FrostwolfLieutenant:
		case CardIds.FrostwolfLieutenantBattlegrounds:
			addStatsToBoard(
				avenger,
				boardWithDeadEntity,
				avenger.cardId === CardIds.FrostwolfLieutenantBattlegrounds ? 2 : 1,
				0,
				allCards,
				spectator,
			);
			break;
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
		case CardIds.PalescaleCrocolisk:
			const target1 = grantRandomStats(avenger, boardWithDeadEntity, 6, 6, Race.BEAST, allCards, spectator);
			if (!!target1) {
				spectator.registerPowerTarget(avenger, target1, boardWithDeadEntity);
			}
			break;
		case CardIds.PalescaleCrocoliskBattlegrounds:
			const target2 = grantRandomStats(avenger, boardWithDeadEntity, 12, 12, Race.BEAST, allCards, spectator);
			if (!!target2) {
				spectator.registerPowerTarget(avenger, target2, boardWithDeadEntity);
			}
			break;
		case CardIds.ImpatientDoomsayer:
			addCardsInHand(boardWithDeadEntityHero, 1, boardWithDeadEntity, allCards, spectator);
			break;
		case CardIds.ImpatientDoomsayerBattlegrounds:
			addCardsInHand(boardWithDeadEntityHero, 2, boardWithDeadEntity, allCards, spectator);
			break;
		case CardIds.PashmarTheVengeful:
		case CardIds.PashmarTheVengefulBattlegrounds:
			addCardsInHand(boardWithDeadEntityHero, 1, boardWithDeadEntity, allCards, spectator);
			break;
		case CardIds.WitchwingNestmatron:
			addCardsInHand(boardWithDeadEntityHero, 1, boardWithDeadEntity, allCards, spectator);
			break;
		case CardIds.WitchwingNestmatronBattlegrounds:
			addCardsInHand(boardWithDeadEntityHero, 2, boardWithDeadEntity, allCards, spectator);
			break;
		case CardIds.Thorncaller:
			addCardsInHand(boardWithDeadEntityHero, 1, boardWithDeadEntity, allCards, spectator);
			break;
		case CardIds.ThorncallerBattlegrounds:
			addCardsInHand(boardWithDeadEntityHero, 2, boardWithDeadEntity, allCards, spectator, CardIds.BloodGem);
			break;
		case CardIds.Sisefin:
			const validTargets = boardWithDeadEntity.filter((e) => !e.poisonous);
			const murloc = getRandomAliveMinion(validTargets, Race.MURLOC, allCards);
			if (murloc) {
				murloc.poisonous = true;
				spectator.registerPowerTarget(avenger, murloc, boardWithDeadEntity);
			}
			break;
		case CardIds.SisefinBattlegrounds:
			for (let i = 0; i < 2; i++) {
				const validTargets = boardWithDeadEntity.filter((e) => !e.poisonous);
				const murloc2 = getRandomAliveMinion(validTargets, Race.MURLOC, allCards);
				if (murloc2) {
					murloc2.poisonous = true;
					spectator.registerPowerTarget(avenger, murloc2, boardWithDeadEntity);
				}
			}
			break;
		case CardIds.MechanoTank:
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
		case CardIds.MechanoTankBattlegrounds:
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
		case CardIds.TonyTwoTusk:
			const nonGoldenMinions = boardWithDeadEntity
				.filter((e) => e.entityId !== avenger.entityId)
				.filter((e) => {
					const ref = allCards.getCard(e.cardId);
					return !!ref.battlegroundsPremiumDbfId && !!allCards.getCardFromDbfId(ref.battlegroundsPremiumDbfId).id;
				});
			const pirate = getRandomAliveMinion(nonGoldenMinions, Race.PIRATE, allCards);
			if (pirate) {
				makeMinionGolden(pirate, avenger, boardWithDeadEntity, allCards, spectator);
			}
			break;
		case CardIds.TonyTwoTuskBattlegrounds:
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
	}
	boardWithDeadEntityHero.avengeCurrent = boardWithDeadEntityHero.avengeDefault;
};
