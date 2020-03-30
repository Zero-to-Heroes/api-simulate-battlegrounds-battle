import { AllCardsService, CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../src/board-entity';
import { CardsData } from '../../src/cards/cards-data';
import { PlayerEntity } from '../../src/player-entity';
import { SharedState } from '../../src/simulation/shared-state';
import { Simulator } from '../../src/simulation/simulator';
import { buildSingleBoardEntity } from '../../src/utils';
import cardsJson from '../cards.json';

describe('Baron Rivendare', () => {
	const sharedState = new SharedState();

	test('Baron Rivendare triggers summoned deathrattles twice (normal)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity(CardIds.Collectible.Neutral.Mecharoo, cards, sharedState.currentEntityId++),
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.BaronRivendare,
					cards,
					sharedState.currentEntityId++,
				),
				attack: 0,
			},
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			buildSingleBoardEntity(CardIds.Collectible.Neutral.RockpoolHunter, cards, sharedState.currentEntityId++),
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(6);
	});

	test('Baron Rivendare triggers damage deathrattles twice (normal)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity(CardIds.Collectible.Neutral.KaboomBot, cards, sharedState.currentEntityId++),
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.BaronRivendare,
					cards,
					sharedState.currentEntityId++,
				),
				attack: 0,
			},
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
				health: 6,
			},
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.RockpoolHunter,
					cards,
					sharedState.currentEntityId++,
				),
				health: 4,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(6);
	});

	test('Baron Rivendare triggers buff deathrattles twice (normal)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity(CardIds.Collectible.Neutral.SpawnOfNzoth, cards, sharedState.currentEntityId++),
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.BaronRivendare,
					cards,
					sharedState.currentEntityId++,
				),
				attack: 0,
				health: 1,
			},
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.RockpoolHunter,
					cards,
					sharedState.currentEntityId++,
				),
				health: 4,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(6);
	});

	test('Baron Rivendare triggers buff deathrattles three times (upgraded)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity(CardIds.Collectible.Neutral.SpawnOfNzoth, cards, sharedState.currentEntityId++),
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Neutral.BaronRivendareTavernBrawl,
					cards,
					sharedState.currentEntityId++,
				),
				attack: 0,
				health: 1,
			},
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.RockpoolHunter,
					cards,
					sharedState.currentEntityId++,
				),
				attack: 3,
				health: 5,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(6);
	});

	test('Multiple Baron Rivendares have no cumulated effect', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity(CardIds.Collectible.Neutral.SpawnOfNzoth, cards, sharedState.currentEntityId++),
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.BaronRivendare,
					cards,
					sharedState.currentEntityId++,
				),
				attack: 0,
				health: 1,
			},
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.BaronRivendare,
					cards,
					sharedState.currentEntityId++,
				),
				attack: 0,
				health: 1,
			},
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.RockpoolHunter,
					cards,
					sharedState.currentEntityId++,
				),
				attack: 3,
				health: 7,
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
