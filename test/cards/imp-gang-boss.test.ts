import { AllCardsService, CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../src/board-entity';
import { CardsData } from '../../src/cards/cards-data';
import { PlayerEntity } from '../../src/player-entity';
import { SharedState } from '../../src/simulation/shared-state';
import { Simulator } from '../../src/simulation/simulator';
import { buildSingleBoardEntity } from '../../src/utils';
import cardsJson from '../cards.json';

describe('Imp Gang Boss', () => {
	const sharedState = new SharedState();

	test('Imp Gang Boss spawns an imp when dealt damage (normal)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity(CardIds.Collectible.Warlock.ImpGangBoss, cards, sharedState.currentEntityId++),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Neutral.WrathWeaver,
					cards,
					sharedState.currentEntityId++,
				),
				attack: 4,
				health: 3,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('tied');
	});

	test('Imp Gang Boss spawns an imp when dealt damage (upgraded)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity(
				CardIds.NonCollectible.Warlock.ImpGangBossTavernBrawl,
				cards,
				sharedState.currentEntityId++,
			),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Neutral.WrathWeaver,
					cards,
					sharedState.currentEntityId++,
				),
				attack: 8,
				health: 6,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('tied');
	});

	test('Imp Gang Boss does not spawn an imp when board is full', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity(CardIds.Collectible.Warlock.ImpGangBoss, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, sharedState.currentEntityId++),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Neutral.WrathWeaver,
					cards,
					sharedState.currentEntityId++,
				),
				attack: 4,
				health: 8,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('tied');
	});

	test('Imp Gang Boss does not spawn an imp when board is full even if another minion dies at the same time', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity(CardIds.Collectible.Neutral.Mecharoo, cards, sharedState.currentEntityId++), // So that board stays full even after attack
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, sharedState.currentEntityId++),
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Warlock.ImpGangBoss,
					cards,
					sharedState.currentEntityId++,
				),
				taunt: true,
				attack: 8,
			},
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(CardIds.Collectible.Hunter.CaveHydra, cards, sharedState.currentEntityId++),
				attack: 4,
				health: 8,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(6);
	});
});

function buildCardsService() {
	const service = new AllCardsService();
	service['allCards'] = [...(cardsJson as any[])];
	return service;
}
