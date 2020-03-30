import { AllCardsService, CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../src/board-entity';
import { CardsData } from '../../src/cards/cards-data';
import { PlayerEntity } from '../../src/player-entity';
import { Simulator } from '../../src/simulation/simulator';
import { buildSingleBoardEntity } from '../../src/utils';
import cardsJson from '../cards.json';

describe('Murloc Tidecaller', () => {
	test('Murloc Tidecaller attack is upgraded when murloc is summoned', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity('UNG_010', cards, 1), // Sated Threshadon
			{ ...buildSingleBoardEntity('EX1_509', cards, 3), taunt: true }, // Murloc Tidecaller
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 2), // So that we attack first
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{ ...buildSingleBoardEntity('BGS_039', cards, 4), attack: 10 }, // Dragonspawn Lieutenant
			{ ...buildSingleBoardEntity('BGS_039', cards, 5), health: 7, taunt: false }, // Dragonspawn Lieutenant
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
	});

	test('Murloc Tidecaller attack is not upgraded when another minion is summoned', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity('BOT_312', cards, 1), // Replicating Menace
			{ ...buildSingleBoardEntity('EX1_509', cards, 3), taunt: true }, // Murloc Tidecaller
			buildSingleBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 2),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{ ...buildSingleBoardEntity('BGS_039', cards, 2), attack: 10 }, // Dragonspawn Lieutenant
			{ ...buildSingleBoardEntity('BGS_039', cards, 4), health: 7 }, // Dragonspawn Lieutenant
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
