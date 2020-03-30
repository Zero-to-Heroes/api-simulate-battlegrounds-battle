import { AllCardsService, CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../src/board-entity';
import { CardsData } from '../../src/cards/cards-data';
import { PlayerEntity } from '../../src/player-entity';
import { SharedState } from '../../src/simulation/shared-state';
import { Simulator } from '../../src/simulation/simulator';
import { buildSingleBoardEntity } from '../../src/utils';
import cardsJson from '../cards.json';

describe('King Bagurgle', () => {
	const sharedState = new SharedState();

	test('King Bargugle buffs friendly murlocs (normal)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Neutral.KingBagurgle,
					cards,
					sharedState.currentEntityId++,
				),
				attack: 1,
				health: 1,
			},
			buildSingleBoardEntity(CardIds.Collectible.Neutral.MurlocTinyfin, cards, sharedState.currentEntityId++),
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
				attack: 4,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('tied');
	});

	test('King Bagurgle buffs friendly murlocs (upgraded)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Neutral.KingBagurgleTavernBrawl,
					cards,
					sharedState.currentEntityId++,
				),
				attack: 1,
				health: 1,
			},
			buildSingleBoardEntity(CardIds.Collectible.Neutral.MurlocTinyfin, cards, sharedState.currentEntityId++),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.RockpoolHunter,
					cards,
					sharedState.currentEntityId++,
				),
				health: 6,
				attack: 6,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('tied');
	});

	test('King Bagurgle does not buff friendly non-murlocs', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Neutral.KingBagurgleTavernBrawl,
					cards,
					sharedState.currentEntityId++,
				),
				attack: 1,
				health: 1,
			},
			buildSingleBoardEntity(CardIds.Collectible.Neutral.MicroMachine, cards, sharedState.currentEntityId++),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.RockpoolHunter,
					cards,
					sharedState.currentEntityId++,
				),
				health: 3,
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
