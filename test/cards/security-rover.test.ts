import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../src/board-entity';
import { AllCardsService } from '../../src/cards/cards';
import { CardsData } from '../../src/cards/cards-data';
import { PlayerEntity } from '../../src/player-entity';
import { Simulator } from '../../src/simulation/simulator';
import { buildSingleBoardEntity } from '../../src/utils';
import cardsJson from '../cards.json';

describe('Security Rover', () => {
	test('Security Rover spawns a mech when dealt damage (normal)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			buildSingleBoardEntity(CardIds.Collectible.Warrior.SecurityRover, cards, 2),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			{
				...buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
				attack: 6,
				health: 4,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('tied');
	});

	test('Security Rover spawns a mech when dealt damage (upgraded)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			buildSingleBoardEntity(CardIds.NonCollectible.Warrior.SecurityRoverTavernBrawl, cards, 2),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			{
				...buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
				attack: 12,
				health: 8,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('tied');
	});

	test('Security Rover does not spawn a mech when board is full', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			buildSingleBoardEntity(CardIds.Collectible.Warrior.SecurityRover, cards, 2),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			{
				...buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
				attack: 6,
				health: 8,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('tied');
	});

	test('Security Rover does not spawn a mech when board is full even if another minion dies at the same time', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			buildSingleBoardEntity(CardIds.Collectible.Neutral.Mecharoo, cards, 3), // So that board stays full even after attack
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
			{ ...buildSingleBoardEntity(CardIds.Collectible.Warrior.SecurityRover, cards, 2), taunt: true },
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			{
				...buildSingleBoardEntity(CardIds.Collectible.Hunter.CaveHydra, cards, 3),
				attack: 6,
				health: 8,
			},
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
