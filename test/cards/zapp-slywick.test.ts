import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../src/board-entity';
import { AllCardsService } from '../../src/cards/cards';
import { CardsData } from '../../src/cards/cards-data';
import { PlayerEntity } from '../../src/player-entity';
import { SharedState } from '../../src/simulation/shared-state';
import { Simulator } from '../../src/simulation/simulator';
import { buildSingleBoardEntity } from '../../src/utils';
import cardsJson from '../cards.json';

describe('Zapp Slywick', () => {
	const sharedState = new SharedState();

	test('Zapp Slywick attacks the minions with the lowest attack first', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: readonly BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Neutral.ZappSlywick,
					cards,
					sharedState.currentEntityId++,
				),
				health: 12,
			},
			buildSingleBoardEntity(CardIds.Collectible.Hunter.Alleycat, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.Collectible.Hunter.Alleycat, cards, sharedState.currentEntityId++),
			buildSingleBoardEntity(CardIds.Collectible.Hunter.Alleycat, cards, sharedState.currentEntityId++),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Warlock.VulgarHomunculus,
					cards,
					sharedState.currentEntityId++,
				),
				attack: 4,
			},
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Neutral.SoulJugglerTavernBrawl,
					cards,
					sharedState.currentEntityId++,
				),
				attack: 3,
			},
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Neutral.SoulJugglerTavernBrawl,
					cards,
					sharedState.currentEntityId++,
				),
				attack: 3,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
	});
});

function buildCardsService() {
	const service = new AllCardsService();
	service['allCards'] = [...(cardsJson as any[])];
	return service;
}
