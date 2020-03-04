import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../src/board-entity';
import { AllCardsService } from '../../src/cards/cards';
import { CardsData } from '../../src/cards/cards-data';
import { PlayerEntity } from '../../src/player-entity';
import { Simulator } from '../../src/simulation/simulator';
import { buildBoardEntity } from '../../src/utils';
import cardsJson from '../cards.json';

describe('Cobalt Guardian', () => {
	test('Cobalt Guardian gains Divine Shield if a friendly mech spawns', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			buildBoardEntity(CardIds.Collectible.Neutral.Mecharoo, cards, 2),
			buildBoardEntity(CardIds.Collectible.Paladin.CobaltGuardian, cards, 1),
			{ ...buildBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3), taunt: true },
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			{
				...buildBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
				taunt: true,
				attack: 5,
				health: 9,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(4);
	});

	test('Cobalt Guardian does not gain Divine Shield if an enemy mech spawns', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			{ ...buildBoardEntity(CardIds.Collectible.Paladin.CobaltGuardian, cards, 1), health: 2 },
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			{ ...buildBoardEntity(CardIds.Collectible.Neutral.Mecharoo, cards, 3), taunt: true },
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('tied');
	});

	test('Cobalt Guardian does not gain Divine Shield if a friendly non-mech spawns', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			{ ...buildBoardEntity(CardIds.NonCollectible.Neutral.Imprisoner, cards, 2), taunt: true },
			buildBoardEntity(CardIds.Collectible.Paladin.CobaltGuardian, cards, 1),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			{
				...buildBoardEntity(CardIds.NonCollectible.Neutral.WrathWeaver, cards, 3),
				taunt: true,
				attack: 5,
				health: 10,
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
