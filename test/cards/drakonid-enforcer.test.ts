import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../src/board-entity';
import { AllCardsService } from '../../src/cards/cards';
import { CardsData } from '../../src/cards/cards-data';
import { PlayerEntity } from '../../src/player-entity';
import { Simulator } from '../../src/simulation/simulator';
import { buildSingleBoardEntity } from '../../src/utils';
import cardsJson from '../cards.json';

describe('Drakonid Enforcer', () => {
	test('Drakonid Enforcer is buffed after a friendly minion loses divine shield (normal)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			{ ...buildSingleBoardEntity(CardIds.Collectible.Neutral.ArgentSquire, cards, 2), taunt: true },
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.DrakonidEnforcer, cards, 1),
		];
		const playerEntity: PlayerEntity = { tavernTier: 4 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
				taunt: true,
				attack: 7,
				health: 7,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(8);
	});

	test('Drakonid Enforcer is buffed after a friendly minion loses divine shield (upgraded)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			{ ...buildSingleBoardEntity(CardIds.Collectible.Neutral.ArgentSquire, cards, 2), taunt: true },
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.DrakonidEnforcerTavernBrawl, cards, 1),
		];
		const playerEntity: PlayerEntity = { tavernTier: 4 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
				taunt: true,
				attack: 15,
				health: 12,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(8);
	});

	test('Drakonid Enforcer is not buffed after an enemy minion loses divine shield', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.DrakonidEnforcer, cards, 1),
		];
		const playerEntity: PlayerEntity = { tavernTier: 4 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{ ...buildSingleBoardEntity(CardIds.Collectible.Neutral.ArgentSquire, cards, 2), taunt: true },
			{
				...buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
				attack: 5,
				health: 4,
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
