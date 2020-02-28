import { BoardEntity } from '../src/board-entity';
import { AllCardsService } from '../src/cards/cards';
import { CardsSpawn } from '../src/cards/cards-spawn.service';
import { PlayerEntity } from '../src/player-entity';
import { Simulator } from '../src/simulation/simulator';
import { buildBoardEntity } from '../src/utils';
import cardsJson from './cards.json';

test('single entity board wins against empty board', async () => {
	const cards = buildCardsService();
	await cards.initializeCardsDb();
	const spawns = new CardsSpawn(cards);
	const simulator = new Simulator(cards, spawns);
	const playerBoard: readonly BoardEntity[] = [
		buildBoardEntity('EX1_162', cards), // Dire Wolf Alpha
	];
	const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
	const opponentBoard: readonly BoardEntity[] = [];
	const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

	const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

	expect(result).not.toBeNull();
	expect(result.result).toBe('won');
	expect(result.damageDealt).toBe(2);
});

test('empty board loses against single entity board', async () => {
	const cards = buildCardsService();
	await cards.initializeCardsDb();
	const spawns = new CardsSpawn(cards);
	const simulator = new Simulator(cards, spawns);
	const playerBoard: readonly BoardEntity[] = [];
	const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
	const opponentBoard: readonly BoardEntity[] = [
		buildBoardEntity('EX1_162', cards), // Dire Wolf Alpha
	];
	const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

	const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

	expect(result).not.toBeNull();
	expect(result.result).toBe('lost');
	expect(result.damageDealt).toBe(2);
});

test('empty board ties against another entity board', async () => {
	const cards = buildCardsService();
	await cards.initializeCardsDb();
	const spawns = new CardsSpawn(cards);
	const simulator = new Simulator(cards, spawns);
	const playerBoard: readonly BoardEntity[] = [];
	const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
	const opponentBoard: readonly BoardEntity[] = [];
	const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

	const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

	expect(result).not.toBeNull();
	expect(result.result).toBe('tied');
	expect(result.damageDealt).toBeFalsy();
});

test('two identical warbands tie the battle', async () => {
	const cards = buildCardsService();
	await cards.initializeCardsDb();
	const spawns = new CardsSpawn(cards);
	const simulator = new Simulator(cards, spawns);
	const playerBoard: readonly BoardEntity[] = [
		buildBoardEntity('EX1_162', cards, 1), // Dire Wolf Alpha
	];
	const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
	const opponentBoard: readonly BoardEntity[] = [
		buildBoardEntity('EX1_162', cards, 2), // Dire Wolf Alpha
	];
	const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

	const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

	expect(result).not.toBeNull();
	expect(result.result).toBe('tied');
	expect(result.damageDealt).toBeFalsy();
});

test('argent squires wins against Wrath Weaver', async () => {
	const cards = buildCardsService();
	await cards.initializeCardsDb();
	const spawns = new CardsSpawn(cards);
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

test('Mecharoo wins against Wrath Weaver', async () => {
	const cards = buildCardsService();
	await cards.initializeCardsDb();
	const spawns = new CardsSpawn(cards);
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
	const spawns = new CardsSpawn(cards);
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
	for (let i = 0; i < 20; i++) {
		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('lost');
		expect(result.damageDealt).toBe(3);
	}
});

function buildCardsService() {
	const service = new AllCardsService();
	service['allCards'] = [...(cardsJson as any[])];
	return service;
}
