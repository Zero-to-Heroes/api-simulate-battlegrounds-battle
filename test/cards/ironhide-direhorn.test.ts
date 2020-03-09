import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../src/board-entity';
import { AllCardsService } from '../../src/cards/cards';
import { CardsData } from '../../src/cards/cards-data';
import { PlayerEntity } from '../../src/player-entity';
import { SharedState } from '../../src/simulation/shared-state';
import { Simulator } from '../../src/simulation/simulator';
import { buildSingleBoardEntity } from '../../src/utils';
import cardsJson from '../cards.json';

describe('Ironhide Direhorn', () => {
	const sharedState = new SharedState();

	test('Overkill is triggered (normal)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity(CardIds.Collectible.Druid.IronhideDirehorn, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.Collectible.Hunter.Alleycat, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.Collectible.Hunter.Alleycat, cards, sharedState.currentEntityId++),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.RockpoolHunter,
					cards,
					sharedState.currentEntityId++,
				),
				attack: 7,
				taunt: true,
			},
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.RockpoolHunter,
					cards,
					sharedState.currentEntityId++,
				),
				attack: 5,
				health: 7,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('tied');
	});

	test('Overkill is triggered (upgraded)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity(
				CardIds.NonCollectible.Druid.IronhideDirehornTavernBrawl,
				cards,
				sharedState.currentEntityId++,
			),
			buildSingleBoardEntity(CardIds.Collectible.Hunter.Alleycat, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.Collectible.Hunter.Alleycat, cards, sharedState.currentEntityId++),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.RockpoolHunter,
					cards,
					sharedState.currentEntityId++,
				),
				attack: 14,
				taunt: true,
			},
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.RockpoolHunter,
					cards,
					sharedState.currentEntityId++,
				),
				attack: 10,
				health: 12,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('tied');
	});

	test('Overkill is not triggered while defending', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity(
				CardIds.NonCollectible.Druid.IronhideDirehornTavernBrawl,
				cards,
				sharedState.currentEntityId++,
			),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.RockpoolHunter,
					cards,
					sharedState.currentEntityId++,
				),
				attack: 14,
				taunt: true,
			},
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.RockpoolHunter,
					cards,
					sharedState.currentEntityId++,
				),
				attack: 10,
				health: 10,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('lost');
	});

	test('Overkill is not triggered if board is full', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity(CardIds.Collectible.Druid.IronhideDirehorn, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.Collectible.Hunter.Alleycat, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.Collectible.Hunter.Alleycat, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.Collectible.Hunter.Alleycat, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.Collectible.Hunter.Alleycat, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.Collectible.Hunter.Alleycat, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.Collectible.Hunter.Alleycat, cards, sharedState.currentEntityId++),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.RockpoolHunter,
					cards,
					sharedState.currentEntityId++,
				),
				taunt: true,
			},
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.RockpoolHunter,
					cards,
					sharedState.currentEntityId++,
				),
				attack: 7,
				health: 13,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('tied');
	});

	test('Overkill is triggered if board is full but ironhide dies while attacking', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity(CardIds.Collectible.Druid.IronhideDirehorn, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.Collectible.Hunter.Alleycat, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.Collectible.Hunter.Alleycat, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.Collectible.Hunter.Alleycat, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.Collectible.Hunter.Alleycat, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.Collectible.Hunter.Alleycat, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.Collectible.Hunter.Alleycat, cards, sharedState.currentEntityId++),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.RockpoolHunter,
					cards,
					sharedState.currentEntityId++,
				),
				attack: 7,
				health: 2,
				taunt: true,
			},
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.RockpoolHunter,
					cards,
					sharedState.currentEntityId++,
				),
				attack: 7,
				health: 11,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('tied');
	});
});

function buildCardsService() {
	const service = new AllCardsService();
	service['allCards'] = [...(cardsJson as any[])];
	return service;
}
