import { AllCardsService, CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../src/board-entity';
import { CardsData } from '../../src/cards/cards-data';
import { PlayerEntity } from '../../src/player-entity';
import { Simulator } from '../../src/simulation/simulator';
import { buildSingleBoardEntity } from '../../src/utils';
import cardsJson from '../cards.json';

describe('Bolvar', () => {
	test('Bolvar is buffed after he loses divine shield (normal)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			{ ...buildSingleBoardEntity(CardIds.Collectible.Paladin.BolvarFireblood, cards, 1), health: 3 },
		];
		const playerEntity: PlayerEntity = { tavernTier: 4 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			buildSingleBoardEntity(CardIds.Collectible.Warlock.VulgarHomunculus, cards, 3),
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(8);
	});

	test('Bolvar is buffed after he loses divine shield (upgraded)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(CardIds.NonCollectible.Paladin.BolvarFirebloodTavernBrawl, cards, 1),
				health: 3,
			},
		];
		const playerEntity: PlayerEntity = { tavernTier: 4 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{ ...buildSingleBoardEntity(CardIds.Collectible.Warlock.VulgarHomunculus, cards, 3), health: 8 },
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(8);
	});

	test('Bolvar is buffed after a friendly minion loses divine shield (normal)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			{ ...buildSingleBoardEntity(CardIds.Collectible.Neutral.ArgentSquire, cards, 2), taunt: true },
			buildSingleBoardEntity(CardIds.Collectible.Paladin.BolvarFireblood, cards, 1),
		];
		const playerEntity: PlayerEntity = { tavernTier: 4 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
				taunt: true,
				attack: 5,
				health: 10,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(8);
	});

	test('Bolvar is buffed after a friendly minion loses divine shield (upgraded)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			{ ...buildSingleBoardEntity(CardIds.Collectible.Neutral.ArgentSquire, cards, 2), taunt: true },
			buildSingleBoardEntity(CardIds.NonCollectible.Paladin.BolvarFirebloodTavernBrawl, cards, 1),
		];
		const playerEntity: PlayerEntity = { tavernTier: 4 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
				taunt: true,
				attack: 5,
				health: 18,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(8);
	});

	test('Bolvar is not buffed after an enemy minion loses divine shield', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity(CardIds.Collectible.Paladin.BolvarFireblood, cards, 1),
		];
		const playerEntity: PlayerEntity = { tavernTier: 4 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{ ...buildSingleBoardEntity(CardIds.Collectible.Neutral.ArgentSquire, cards, 2), taunt: true },
			{
				...buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
				attack: 6,
				health: 5, // We still need to account for Bolvar being buffed by himself
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('lost');
	});
});

function buildCardsService() {
	const service = new AllCardsService();
	service['allCards'] = [...(cardsJson as any[])];
	return service;
}
