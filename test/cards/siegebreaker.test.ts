import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../src/board-entity';
import { AllCardsService } from '../../src/cards/cards';
import { CardsData } from '../../src/cards/cards-data';
import { PlayerEntity } from '../../src/player-entity';
import { Simulator } from '../../src/simulation/simulator';
import { buildBoardEntity } from '../../src/utils';
import cardsJson from '../cards.json';

describe('Siegebreaker', () => {
	test('Siegebreaker aura works properly even on a minion two spaces removed', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			buildBoardEntity('BGS_039', cards, 1), // Dragonspawn Lieutenant
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			buildBoardEntity('LOOT_013', cards, 2), // Vulgar Homonculus
			buildBoardEntity('UNG_073', cards, 3), // Rockpool Hunter
			buildBoardEntity('EX1_185', cards, 4), // Siegebreaker
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('lost');
		// This makes sure that the Humonculous kills the lieutenant, but not the other way around
		expect(result.damageDealt).toBe(7);
	});

	test('Siegebreaker aura works only on demons', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			buildBoardEntity('BGS_039', cards, 1), // Dragonspawn Lieutenant
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			buildBoardEntity('BGS_039', cards, 2), // Dragonspawn Lieutenant
			{ ...buildBoardEntity('EX1_185', cards, 4), taunt: false }, // Siegebreaker
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('lost');
		expect(result.damageDealt).toBe(5);
	});

	test('Siegebreaker aura ends once it is killed', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			{ ...buildBoardEntity('BGS_039', cards, 5), attack: 8 } as BoardEntity, // Dragonspawn Lieutenant
			buildBoardEntity('UNG_073', cards, 1), // Rockpool hunter
			buildBoardEntity('BGS_039', cards, 4), // Dragonspawn Lieutenant
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			buildBoardEntity('EX1_185', cards, 2), // Siegebreaker
			buildBoardEntity(CardIds.Collectible.Neutral.RockpoolHunter, cards, 3),
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
