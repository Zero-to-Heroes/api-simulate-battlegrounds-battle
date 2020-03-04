import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../src/board-entity';
import { AllCardsService } from '../../src/cards/cards';
import { CardsData } from '../../src/cards/cards-data';
import { PlayerEntity } from '../../src/player-entity';
import { Simulator } from '../../src/simulation/simulator';
import { buildSingleBoardEntity } from '../../src/utils';
import cardsJson from '../cards.json';

describe('Red Whelp', () => {
	test('Start of combat is triggered (normal)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.RedWhelp, cards, 1),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.DragonspawnLieutenant, cards, 2),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.DragonspawnLieutenant, cards, 4),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.DragonspawnLieutenant, cards, 5),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			{ ...buildSingleBoardEntity(CardIds.Collectible.Warlock.VulgarHomunculus, cards, 3) },
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(5);
	});

	test('Start of combat is triggered (upgraded)', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			{ ...buildSingleBoardEntity(CardIds.NonCollectible.Neutral.RedWhelpTavernBrawl, cards, 1), health: 1 },
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.DragonspawnLieutenant, cards, 2),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.DragonspawnLieutenant, cards, 4),
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.DragonspawnLieutenant, cards, 5),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			{ ...buildSingleBoardEntity(CardIds.Collectible.Warlock.VulgarHomunculus, cards, 3) },
			{ ...buildSingleBoardEntity(CardIds.Collectible.Warlock.VulgarHomunculus, cards, 3) },
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(5);
	});
});

function buildCardsService() {
	const service = new AllCardsService();
	service['allCards'] = [...(cardsJson as any[])];
	return service;
}
