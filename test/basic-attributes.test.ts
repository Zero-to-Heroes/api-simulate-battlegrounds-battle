import { BoardEntity } from '../src/board-entity';
import { AllCardsService } from '../src/cards/cards';
import { CardsData } from '../src/cards/cards-data';
import { PlayerEntity } from '../src/player-entity';
import { Simulator } from '../src/simulation/simulator';
import { buildBoardEntity } from '../src/utils';
import cardsJson from './cards.json';

describe('Basic attributes', () => {
	test('Divine Shield works properly', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);
		const playerBoard: readonly BoardEntity[] = [
			buildBoardEntity('EX1_008', cards, 1), // Argent Squire
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			buildBoardEntity('BGS_004', cards, 2), // Wrath Weaver
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(2);
	});

	test('Deathrattle summon works properly', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);
		const playerBoard: readonly BoardEntity[] = [
			buildBoardEntity('BOT_445', cards, 1), // Mecharoo
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			buildBoardEntity('BGS_004', cards, 2), // Wrath Weaver
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(2);
	});

	test('Taunt works properly', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			buildBoardEntity('BGS_004', cards, 1), // Wrath Weaver
			buildBoardEntity('BGS_004', cards, 2), // Wrath Weaver
			buildBoardEntity('BGS_004', cards, 3), // Wrath Weaver
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			buildBoardEntity('BGS_039', cards, 4), // Dragonspawn Lieutenant
			buildBoardEntity('BGS_028', cards, 5), // Pogo
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		// The player will attack first always, and never kill the Pogo, thus always taking 3 damage
		for (let i = 0; i < 10; i++) {
			const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

			expect(result).not.toBeNull();
			expect(result.result).toBe('lost');
			expect(result.damageDealt).toBe(3);
		}
	}, 10000);

	test('Reborn works properly', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			buildBoardEntity('BGS_034', cards, 1), // Bronze Warden
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			buildBoardEntity('BGS_028', cards, 5), // Pogo
			buildBoardEntity('BGS_028', cards, 6), // Pogo
			buildBoardEntity('BGS_028', cards, 7), // Pogo
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(4);
	});
});

function buildCardsService() {
	const service = new AllCardsService();
	service['allCards'] = [...(cardsJson as any[])];
	return service;
}
