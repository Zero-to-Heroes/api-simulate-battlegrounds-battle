import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../src/board-entity';
import { AllCardsService } from '../../src/cards/cards';
import { CardsData } from '../../src/cards/cards-data';
import { PlayerEntity } from '../../src/player-entity';
import { Simulator } from '../../src/simulation/simulator';
import { buildBoardEntity } from '../../src/utils';
import cardsJson from '../cards.json';

describe('Old Murkeye', () => {
	test('Old Murkeye attack includes both friendy and enemy minions', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			buildBoardEntity(CardIds.Collectible.Neutral.OldMurkEye, cards, 1),
			buildBoardEntity(CardIds.Collectible.Neutral.RockpoolHunter, cards, 2),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			{
				...buildBoardEntity(CardIds.Collectible.Neutral.RockpoolHunter, cards, 3),
				health: 4,
				attack: 20,
				taunt: true,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(2);
	});

	test('Old Murkeye attack includes both friendy and enemy minions (upgraded)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			buildBoardEntity(CardIds.NonCollectible.Neutral.OldMurkEyeTavernBrawl, cards, 1),
			buildBoardEntity(CardIds.Collectible.Neutral.RockpoolHunter, cards, 2),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			{
				...buildBoardEntity(CardIds.Collectible.Neutral.RockpoolHunter, cards, 3),
				health: 8,
				attack: 20,
				taunt: true,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(2);
	});

	test('Old Murkeye attack is updated as minions die', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			buildBoardEntity(CardIds.Collectible.Neutral.RockpoolHunter, cards, 2),
			buildBoardEntity(CardIds.Collectible.Neutral.OldMurkEye, cards, 1),
			buildBoardEntity(CardIds.Collectible.Neutral.RockpoolHunter, cards, 2),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			{
				...buildBoardEntity(CardIds.Collectible.Warlock.VulgarHomunculus, cards, 3),
				health: 7,
				attack: 20,
				taunt: true,
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
