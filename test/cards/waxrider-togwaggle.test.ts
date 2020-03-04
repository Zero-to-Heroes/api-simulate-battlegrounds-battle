import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../src/board-entity';
import { AllCardsService } from '../../src/cards/cards';
import { CardsData } from '../../src/cards/cards-data';
import { PlayerEntity } from '../../src/player-entity';
import { Simulator } from '../../src/simulation/simulator';
import { buildSingleBoardEntity } from '../../src/utils';
import cardsJson from '../cards.json';

describe('Waxrider Togwaggle', () => {
	test('Waxrider is buffed if a friendly dragon kills an enemy while attacking (normal)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			{ ...buildSingleBoardEntity(CardIds.NonCollectible.Neutral.DragonspawnLieutenant, cards, 1), taunt: false },
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WaxriderTogwaggle, cards, 2),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.DragonspawnLieutenant, cards, 3),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			{ ...buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 1), taunt: true },
			{ ...buildSingleBoardEntity(CardIds.Collectible.Neutral.RockpoolHunter, cards, 1), attack: 6, health: 5 },
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(2);
	});

	test('Waxrider is buffed if a friendly dragon kills an enemy while attacking (upgraded)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			{ ...buildSingleBoardEntity(CardIds.NonCollectible.Neutral.DragonspawnLieutenant, cards, 1), taunt: false },
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WaxriderTogwaggleTavernBrawl, cards, 2),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.DragonspawnLieutenant, cards, 3),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			{ ...buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 1), taunt: true },
			{ ...buildSingleBoardEntity(CardIds.Collectible.Neutral.RockpoolHunter, cards, 1), attack: 9, health: 7 },
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(2);
	});

	test('Waxrider is buffed if a friendly dragon kills an enemy while defending', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WaxriderTogwaggle, cards, 2),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.DragonspawnLieutenant, cards, 3),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			{ ...buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 1), taunt: true },
			{ ...buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 1), taunt: true, attack: 2 },
			{ ...buildSingleBoardEntity(CardIds.Collectible.Neutral.RockpoolHunter, cards, 1), attack: 9, health: 3 },
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('tied');
	});

	test('Waxrider is not buffed if a friendly non-dragon kills an enemy while attacking', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			buildSingleBoardEntity(CardIds.Collectible.Neutral.RockpoolHunter, cards, 1),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WaxriderTogwaggle, cards, 2),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.DragonspawnLieutenant, cards, 3),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			{ ...buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 1), taunt: true },
			{ ...buildSingleBoardEntity(CardIds.Collectible.Neutral.RockpoolHunter, cards, 1), attack: 6, health: 5 },
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
