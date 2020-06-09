import { AllCardsService, CardIds } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../../src/bgs-player-entity';
import { BoardEntity } from '../../src/board-entity';
import { CardsData } from '../../src/cards/cards-data';
import { Simulator } from '../../src/simulation/simulator';
import { buildSingleBoardEntity } from '../../src/utils';
import cardsJson from '../cards.json';

describe('Monstrous Macaw', () => {
	test('Monstrous Macaw triggers friendly minion deathrattle', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);
		const sharedState = simulator['sharedState'];

		const playerBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Neutral.MonstrousMacaw,
					cards,
					true,
					sharedState.currentEntityId++,
				),
			},
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Neutral.KaboomBotTavernBrawl,
					cards,
					true,
					sharedState.currentEntityId++,
				),
			},
		];
		const playerEntity: BgsPlayerEntity = { tavernTier: 1 } as BgsPlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Neutral.DragonspawnLieutenant,
					cards,
					false,
					sharedState.currentEntityId++,
				),
				health: 10,
				attack: 4,
			},
		];
		const opponentEntity: BgsPlayerEntity = { tavernTier: 1 } as BgsPlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(3);
	});
});

function buildCardsService() {
	const service = new AllCardsService();
	service['allCards'] = [...(cardsJson as any[])];
	return service;
}
