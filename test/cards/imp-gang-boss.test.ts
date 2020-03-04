import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../src/board-entity';
import { AllCardsService } from '../../src/cards/cards';
import { CardsData } from '../../src/cards/cards-data';
import { PlayerEntity } from '../../src/player-entity';
import { Simulator } from '../../src/simulation/simulator';
import { buildBoardEntity } from '../../src/utils';
import cardsJson from '../cards.json';

describe('Imp Gang Boss', () => {
	test('Imp Gang Boss spawns an imp when dealt damage (normal)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			buildBoardEntity(CardIds.Collectible.Warlock.ImpGangBoss, cards, 2),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			{
				...buildBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
				attack: 4,
				health: 3,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('tied');
	});

	test('Imp Gang Boss spawns an imp when dealt damage (upgraded)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			buildBoardEntity(CardIds.NonCollectible.Warlock.ImpGangBossTavernBrawl, cards, 2),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			{
				...buildBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
				attack: 8,
				health: 6,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('tied');
	});

	test('Imp Gang Boss does not spawn an imp when board is full', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			buildBoardEntity(CardIds.Collectible.Warlock.ImpGangBoss, cards, 2),
			buildBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
			buildBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
			buildBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
			buildBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
			buildBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
			buildBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			{
				...buildBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
				attack: 4,
				health: 8,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('tied');
	});

	test('Imp Gang Boss does not spawn an imp when board is full even if another minion dies at the same time', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			buildBoardEntity(CardIds.Collectible.Neutral.Mecharoo, cards, 3), // So that board stays full even after attack
			buildBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
			buildBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
			buildBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
			buildBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
			buildBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
			{ ...buildBoardEntity(CardIds.Collectible.Warlock.ImpGangBoss, cards, 2), taunt: true },
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			{
				...buildBoardEntity(CardIds.Collectible.Hunter.CaveHydra, cards, 3),
				attack: 4,
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
