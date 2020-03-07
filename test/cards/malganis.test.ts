import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../src/board-entity';
import { AllCardsService } from '../../src/cards/cards';
import { CardsData } from '../../src/cards/cards-data';
import { PlayerEntity } from '../../src/player-entity';
import { Simulator } from '../../src/simulation/simulator';
import { buildSingleBoardEntity } from '../../src/utils';
import cardsJson from '../cards.json';

describe('MalGanis', () => {
	test('MalGanis aura works properly even on a minion two spaces removed', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			{ ...buildSingleBoardEntity('LOOT_013', cards, 1), attack: 4 }, // Vulgar Homonculus
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			buildSingleBoardEntity('LOOT_013', cards, 2), // Vulgar Homonculus
			buildSingleBoardEntity('UNG_073', cards, 3), // Rockpool Hunter
			buildSingleBoardEntity('GVG_021', cards, 4), // Mal'Ganis
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('lost');
		expect(result.damageDealt).toBe(8);
	});

	test('MalGanis aura works only on demons', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			buildSingleBoardEntity('BGS_039', cards, 1), // Dragonspawn Lieutenant
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			buildSingleBoardEntity('BGS_039', cards, 2), // Dragonspawn Lieutenant
			buildSingleBoardEntity('GVG_021', cards, 4), // Mal'Ganis
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('lost');
		expect(result.damageDealt).toBe(6);
	});

	test('MalGanis aura ends once it is killed', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			{ ...buildSingleBoardEntity('BGS_039', cards, 5), attack: 8 } as BoardEntity, // Dragonspawn Lieutenant
			buildSingleBoardEntity('UNG_073', cards, 1), // Rockpool hunter
			buildSingleBoardEntity('BGS_039', cards, 4), // Dragonspawn Lieutenant
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			{ ...buildSingleBoardEntity('EX1_185', cards, 2), taunt: true }, // MalGanis
			{ ...buildSingleBoardEntity(CardIds.Collectible.Warlock.VulgarHomunculus, cards, 3), taunt: false },
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