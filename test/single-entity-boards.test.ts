import { AllCardsService } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../src/bgs-player-entity';
import { BoardEntity } from '../src/board-entity';
import { CardsData } from '../src/cards/cards-data';
import { Simulator } from '../src/simulation/simulator';
import { buildSingleBoardEntity } from '../src/utils';
import cardsJson from './cards.json';

describe('Single entity boards', () => {
	test('single entity board wins against empty board', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);
		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity('EX1_162', cards), // Dire Wolf Alpha
		];
		const playerEntity: BgsPlayerEntity = { tavernTier: 1 } as BgsPlayerEntity;
		const opponentBoard: BoardEntity[] = [];
		const opponentEntity: BgsPlayerEntity = { tavernTier: 1 } as BgsPlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(2);
	});

	test('empty board loses against single entity board', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);
		const playerBoard: BoardEntity[] = [];
		const playerEntity: BgsPlayerEntity = { tavernTier: 1 } as BgsPlayerEntity;
		const opponentBoard: BoardEntity[] = [
			buildSingleBoardEntity('EX1_162', cards), // Dire Wolf Alpha
		];
		const opponentEntity: BgsPlayerEntity = { tavernTier: 1 } as BgsPlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('lost');
		expect(result.damageDealt).toBe(2);
	});

	test('empty board ties against another entity board', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);
		const playerBoard: BoardEntity[] = [];
		const playerEntity: BgsPlayerEntity = { tavernTier: 1 } as BgsPlayerEntity;
		const opponentBoard: BoardEntity[] = [];
		const opponentEntity: BgsPlayerEntity = { tavernTier: 1 } as BgsPlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('tied');
		expect(result.damageDealt).toBeFalsy();
	});

	test('two identical warbands tie the battle', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);
		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity('EX1_162', cards, 1), // Dire Wolf Alpha
		];
		const playerEntity: BgsPlayerEntity = { tavernTier: 1 } as BgsPlayerEntity;
		const opponentBoard: BoardEntity[] = [
			buildSingleBoardEntity('EX1_162', cards, 2), // Dire Wolf Alpha
		];
		const opponentEntity: BgsPlayerEntity = { tavernTier: 1 } as BgsPlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('tied');
		expect(result.damageDealt).toBeFalsy();
	});
});

function buildCardsService() {
	const service = new AllCardsService();
	service['allCards'] = [...(cardsJson as any[])];
	return service;
}
