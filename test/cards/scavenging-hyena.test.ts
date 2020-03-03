import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../src/board-entity';
import { AllCardsService } from '../../src/cards/cards';
import { CardsData } from '../../src/cards/cards-data';
import { PlayerEntity } from '../../src/player-entity';
import { Simulator } from '../../src/simulation/simulator';
import { buildBoardEntity } from '../../src/utils';
import cardsJson from '../cards.json';

describe('Scavenging Hyena', () => {
	test('Scavenging Hyena is upgraded when beasts die', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			buildBoardEntity(CardIds.Collectible.Hunter.Alleycat, cards, 1),
			{ ...buildBoardEntity(CardIds.Collectible.Hunter.Alleycat, cards, 2), taunt: true },
			buildBoardEntity(CardIds.Collectible.Hunter.ScavengingHyena, cards, 3),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			{
				...buildBoardEntity(CardIds.NonCollectible.Neutral.DragonspawnLieutenant, cards, 4),
				health: 8,
				attack: 3,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(3);
	});

	test('Scavenging Hyena is upgraded when beasts die (upgraded)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			buildBoardEntity(CardIds.Collectible.Hunter.Alleycat, cards, 1),
			{ ...buildBoardEntity(CardIds.Collectible.Hunter.Alleycat, cards, 2), taunt: true },
			buildBoardEntity(CardIds.NonCollectible.Hunter.ScavengingHyenaTavernBrawl, cards, 3),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			{
				...buildBoardEntity(CardIds.NonCollectible.Neutral.DragonspawnLieutenant, cards, 4),
				health: 14,
				attack: 7,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(3);
	});

	test('Scavenging Hyena is not upgraded when a non-beast minion dies', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			buildBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 1),
			{ ...buildBoardEntity(CardIds.Collectible.Hunter.Alleycat, cards, 2), taunt: true },
			buildBoardEntity(CardIds.Collectible.Hunter.ScavengingHyena, cards, 3),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			{
				...buildBoardEntity(CardIds.NonCollectible.Neutral.DragonspawnLieutenant, cards, 4),
				health: 8,
				attack: 3,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('lost');
		expect(result.damageDealt).toBe(2);
	});

	test('Scavenging Hyena is not upgraded when an enemy minion dies', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			buildBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 1),
			{ ...buildBoardEntity(CardIds.Collectible.Hunter.Alleycat, cards, 2), taunt: true },
			buildBoardEntity(CardIds.Collectible.Hunter.ScavengingHyena, cards, 3),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			{ ...buildBoardEntity(CardIds.Collectible.Hunter.Alleycat, cards, 2), taunt: true },
			{
				...buildBoardEntity(CardIds.NonCollectible.Neutral.DragonspawnLieutenant, cards, 4),
				health: 7,
				attack: 3,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('lost');
		expect(result.damageDealt).toBe(2);
	});
});

function buildCardsService() {
	const service = new AllCardsService();
	service['allCards'] = [...(cardsJson as any[])];
	return service;
}
