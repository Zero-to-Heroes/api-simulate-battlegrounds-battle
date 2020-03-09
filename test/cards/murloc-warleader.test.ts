import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../src/board-entity';
import { AllCardsService } from '../../src/cards/cards';
import { CardsData } from '../../src/cards/cards-data';
import { PlayerEntity } from '../../src/player-entity';
import { Simulator } from '../../src/simulation/simulator';
import { buildSingleBoardEntity } from '../../src/utils';
import cardsJson from '../cards.json';

describe('Murloc Warleader', () => {
	test('Murloc Warleader aura works properly even on a minion two spaces removed', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			{ ...buildSingleBoardEntity('LOOT_013', cards, 1), attack: 4 }, // Vulgar Homonculus
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{ ...buildSingleBoardEntity(CardIds.Collectible.Neutral.RockpoolHunter, cards, 3), taunt: true },
			buildSingleBoardEntity(CardIds.Collectible.Neutral.RockpoolHunter, cards, 2),
			buildSingleBoardEntity(CardIds.Collectible.Neutral.MurlocWarleader, cards, 4),
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('lost');
		expect(result.damageDealt).toBe(4);
	});

	test('Murloc Warleader aura works only on murlocs', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity('BGS_039', cards, 1), // Dragonspawn Lieutenant
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			buildSingleBoardEntity('BGS_039', cards, 2), // Dragonspawn Lieutenant
			buildSingleBoardEntity(CardIds.Collectible.Neutral.MurlocWarleader, cards, 4),
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('lost');
		expect(result.damageDealt).toBe(3);
	});

	test('Murloc Warleader aura ends once it is killed', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			{ ...buildSingleBoardEntity('BGS_039', cards, 5), attack: 8 } as BoardEntity, // Dragonspawn Lieutenant
			buildSingleBoardEntity('UNG_073', cards, 1), // Rockpool hunter
			buildSingleBoardEntity('BGS_039', cards, 4), // Dragonspawn Lieutenant
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{ ...buildSingleBoardEntity(CardIds.Collectible.Neutral.MurlocWarleader, cards, 2), taunt: true },
			buildSingleBoardEntity(CardIds.Collectible.Neutral.RockpoolHunter, cards, 3),
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		// First Rockpool dies to the taunt, Wolf dies to the taunt, second rockpool survives the unbuffed taunt
		expect(result.damageDealt).toBe(3);
	});
});

function buildCardsService() {
	const service = new AllCardsService();
	service['allCards'] = [...(cardsJson as any[])];
	return service;
}
