import { AllCardsService, CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../src/board-entity';
import { CardsData } from '../../src/cards/cards-data';
import { PlayerEntity } from '../../src/player-entity';
import { Simulator } from '../../src/simulation/simulator';
import { buildSingleBoardEntity } from '../../src/utils';
import cardsJson from '../cards.json';

describe('Unstable Ghoul', () => {
	test('Unstable Ghoul deals damage to all minions (normal)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity(CardIds.Collectible.Neutral.UnstableGhoul, cards, 1),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 2),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{ ...buildSingleBoardEntity(CardIds.Collectible.Warlock.VulgarHomunculus, cards, 3), attack: 3 },
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 4),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 5),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 6),
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('lost');
		expect(result.damageDealt).toBe(2);
	});

	test('Unstable Ghoul deals damage to all minions (upgraded)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.UnstableGhoulTavernBrawl, cards, 1),
			buildSingleBoardEntity(CardIds.Collectible.Neutral.MicroMachine, cards, 2),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{ ...buildSingleBoardEntity(CardIds.Collectible.Warlock.VulgarHomunculus, cards, 3), attack: 6 },
			buildSingleBoardEntity(CardIds.Collectible.Neutral.MicroMachine, cards, 4),
			buildSingleBoardEntity(CardIds.Collectible.Neutral.MicroMachine, cards, 5),
			buildSingleBoardEntity(CardIds.Collectible.Neutral.MicroMachine, cards, 6),
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('tied');
	});

	test('Minions with divine shield dont take damage and lose DS instead', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity(CardIds.Collectible.Neutral.UnstableGhoul, cards, 1),
			buildSingleBoardEntity(CardIds.Collectible.Neutral.ArgentSquire, cards, 2),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{ ...buildSingleBoardEntity(CardIds.Collectible.Warlock.VulgarHomunculus, cards, 3), attack: 3, health: 2 },
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 4),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 5),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 6),
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(2);
	});

	test('Unstable Ghoul chain reactions', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity(CardIds.Collectible.Neutral.UnstableGhoul, cards, 1),
			{ ...buildSingleBoardEntity(CardIds.Collectible.Neutral.UnstableGhoul, cards, 10), health: 1 },
			{ ...buildSingleBoardEntity(CardIds.Collectible.Neutral.UnstableGhoul, cards, 11), health: 2 },
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{ ...buildSingleBoardEntity(CardIds.Collectible.Warlock.VulgarHomunculus, cards, 3), attack: 3 },
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 4),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 5),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 6),
			{ ...buildSingleBoardEntity(CardIds.Collectible.Warlock.VulgarHomunculus, cards, 3), health: 3 },
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('tied');
	});

	test('Unstable Ghoul chain reactions includes opponent', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity(CardIds.Collectible.Neutral.UnstableGhoul, cards, 1),
			{
				...buildSingleBoardEntity(CardIds.Collectible.Neutral.UnstableGhoul, cards, 11),
				health: 2,
				taunt: false,
			},
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{ ...buildSingleBoardEntity(CardIds.Collectible.Warlock.VulgarHomunculus, cards, 3), attack: 3 },
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 4),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 5),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 6),
			{ ...buildSingleBoardEntity(CardIds.Collectible.Neutral.UnstableGhoul, cards, 10), health: 1 },
			{ ...buildSingleBoardEntity(CardIds.Collectible.Warlock.VulgarHomunculus, cards, 3), health: 3 },
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
