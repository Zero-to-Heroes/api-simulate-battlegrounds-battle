import { AllCardsService } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../src/board-entity';
import { CardsData } from '../../src/cards/cards-data';
import { PlayerEntity } from '../../src/player-entity';
import { Simulator } from '../../src/simulation/simulator';
import { buildSingleBoardEntity } from '../../src/utils';
import cardsJson from '../cards.json';

describe('Dire Wolf Alpha', () => {
	test('Dire Wolf Alpha aura works properly to the right', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity('BGS_039', cards, 1), // Dragonspawn Lieutenant
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			buildSingleBoardEntity('BGS_039', cards, 2), // Dragonspawn Lieutenant
			buildSingleBoardEntity('EX1_162', cards, 3), // Dire Wolf Alpha
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('lost');
		// This makes sure that the Lieutenant kills the other lieutenant, but not the other way around
		expect(result.damageDealt).toBe(3);
	});

	test('Dire Wolf Alpha aura works properly to the left', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity('BGS_039', cards, 1), // Dragonspawn Lieutenant
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			buildSingleBoardEntity('BGS_039', cards, 3), // Dragonspawn Lieutenant
			buildSingleBoardEntity('EX1_162', cards, 2), // Dire Wolf Alpha
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('lost');
		// This makes sure that the Lieutenant kills the other lieutenant, but not the other way around
		expect(result.damageDealt).toBe(3);
	});

	test('Dire Wolf Alpha aura has no effect on non-neighbours', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity('UNG_073', cards, 4), // Rockpool hunter
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			buildSingleBoardEntity('BGS_039', cards, 3), // Dragonspawn Lieutenant
			buildSingleBoardEntity('UNG_073', cards, 4), // Rockpool hunter
			buildSingleBoardEntity('EX1_162', cards, 2), // Dire Wolf Alpha
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('lost');
		// Draonspawn and rockpool trade (with the buff the lt would have killed the rockpool and not died)
		expect(result.damageDealt).toBe(3);
	});

	test('Dire Wolf Alpha aura ends once it is killed', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity('UNG_073', cards, 1), // Rockpool hunter
			buildSingleBoardEntity('UNG_073', cards, 4), // Rockpool hunter
			buildSingleBoardEntity('BGS_039', cards, 5), // Dragonspawn Lieutenant
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			buildSingleBoardEntity('EX1_162', cards, 2), // Dire Wolf Alpha
			buildSingleBoardEntity('BGS_039', cards, 3), // Dragonspawn Lieutenant
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		// First Rockpool dies to the taunt, Wolf dies to the taunt, second rockpool survives the unbuffed taunt
		expect(result.damageDealt).toBe(3);
	});
});

function buildCardsService() {
	const service = new AllCardsService();
	service['allCards'] = [...(cardsJson as any[])];
	return service;
}
