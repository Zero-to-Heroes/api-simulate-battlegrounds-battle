import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../src/board-entity';
import { AllCardsService } from '../../src/cards/cards';
import { CardsData } from '../../src/cards/cards-data';
import { PlayerEntity } from '../../src/player-entity';
import { SharedState } from '../../src/simulation/shared-state';
import { Simulator } from '../../src/simulation/simulator';
import { buildSingleBoardEntity } from '../../src/utils';
import cardsJson from '../cards.json';

describe('Herald of Flame', () => {
	const sharedState = new SharedState();

	test('Herald of Flame overkill action is triggered on overkill (normal)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Warrior.HeraldOfFlameBATTLEGROUNDS,
					cards,
					sharedState.currentEntityId++,
				),
				health: 1,
			},
			buildSingleBoardEntity(CardIds.Collectible.Neutral.RockpoolHunter, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.Collectible.Neutral.RockpoolHunter, cards, sharedState.currentEntityId++),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			buildSingleBoardEntity(CardIds.Collectible.Warlock.VulgarHomunculus, cards, sharedState.currentEntityId++),
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.RockpoolHunter,
					cards,
					sharedState.currentEntityId++,
				),
				attack: 10,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(3);
	});

	test('Herald of Flame overkill action is triggered on overkill (upgraded)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Warrior.HeraldOfFlameTavernBrawl,
					cards,
					sharedState.currentEntityId++,
				),
				health: 1,
			},
			buildSingleBoardEntity(CardIds.Collectible.Neutral.RockpoolHunter, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.Collectible.Neutral.RockpoolHunter, cards, sharedState.currentEntityId++),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Warlock.VulgarHomunculus,
					cards,
					sharedState.currentEntityId++,
				),
				health: 9,
			},
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.RockpoolHunter,
					cards,
					sharedState.currentEntityId++,
				),
				health: 6,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(3);
	});

	test('Herald of Flame overkill action is not triggered when dealing the exact amount of damage', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Warrior.HeraldOfFlameBATTLEGROUNDS,
					cards,
					sharedState.currentEntityId++,
				),
				health: 1,
			},
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Warlock.VulgarHomunculus,
					cards,
					sharedState.currentEntityId++,
				),
				health: 5,
			},
			buildSingleBoardEntity(CardIds.Collectible.Neutral.RockpoolHunter, cards, sharedState.currentEntityId++),
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('lost');
		expect(result.damageDealt).toBe(2);
	});

	test('Herald of Flame overkill action is not triggered when not killing the enemy minion', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Warrior.HeraldOfFlameBATTLEGROUNDS,
					cards,
					sharedState.currentEntityId++,
				),
				health: 1,
			},
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Warlock.VulgarHomunculus,
					cards,
					sharedState.currentEntityId++,
				),
				health: 6,
			},
			buildSingleBoardEntity(CardIds.Collectible.Neutral.RockpoolHunter, cards, sharedState.currentEntityId++),
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('lost');
		expect(result.damageDealt).toBe(3);
	});

	test('Herald of Flame overkill action triggers if it itself overkills a minion (chain reaction)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Warrior.HeraldOfFlameBATTLEGROUNDS,
					cards,
					sharedState.currentEntityId++,
				),
				health: 2,
			},
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.Collectible.Warlock.VulgarHomunculus, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, sharedState.currentEntityId++),
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('tied');
	});

	test('Herald of Flame overkill action does not trigger when it is attacked', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Warrior.HeraldOfFlameBATTLEGROUNDS,
					cards,
					sharedState.currentEntityId++,
				),
				health: 1,
			},
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, sharedState.currentEntityId++),
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('lost');
		expect(result.damageDealt).toBe(2);
	});

	test('Sanity test to make sure that it is the left-most minion that takes the hit', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Warrior.HeraldOfFlameBATTLEGROUNDS,
					cards,
					sharedState.currentEntityId++,
				),
				health: 2,
			},
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, sharedState.currentEntityId++),
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Neutral.WrathWeaver,
					cards,
					sharedState.currentEntityId++,
				),
				health: 4,
			},
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.Collectible.Warlock.VulgarHomunculus, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, sharedState.currentEntityId++),
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('lost');
		expect(result.damageDealt).toBe(6);
	});
});

function buildCardsService() {
	const service = new AllCardsService();
	service['allCards'] = [...(cardsJson as any[])];
	return service;
}
