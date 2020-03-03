import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../src/board-entity';
import { AllCardsService } from '../../src/cards/cards';
import { CardsData } from '../../src/cards/cards-data';
import { PlayerEntity } from '../../src/player-entity';
import { Simulator } from '../../src/simulation/simulator';
import { buildBoardEntity } from '../../src/utils';
import cardsJson from '../cards.json';

describe('Spawn of Nzoth', () => {
	test('Spawn of Nzoth buffs all friendly minions (normal)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			buildBoardEntity(CardIds.Collectible.Neutral.SpawnOfNzoth, cards, 1),
			buildBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 2),
			buildBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			{ ...buildBoardEntity(CardIds.Collectible.Warlock.VulgarHomunculus, cards, 3), health: 6 },
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('tied');
	});

	test('Spawn of Nzoth buffs all friendly minions (upgraded)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			buildBoardEntity(CardIds.NonCollectible.Neutral.SpawnOfNzothTavernBrawl, cards, 1),
			buildBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 2),
			buildBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			{ ...buildBoardEntity(CardIds.Collectible.Warlock.VulgarHomunculus, cards, 3), health: 10, attack: 4 },
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
