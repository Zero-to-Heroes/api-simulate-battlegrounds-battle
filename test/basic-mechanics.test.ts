import { BoardEntity } from '../src/board-entity';
import { AllCardsService } from '../src/cards/cards';
import { CardsData } from '../src/cards/cards-data';
import { PlayerEntity } from '../src/player-entity';
import { Simulator } from '../src/simulation/simulator';
import { buildBoardEntity } from '../src/utils';
import cardsJson from './cards.json';

describe('Basic mechanics', () => {
	test('Cleave works properly', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);
		const playerBoard: readonly BoardEntity[] = [
			{ ...buildBoardEntity('LOOT_078', cards, 1), attack: 10 } as BoardEntity, // Cave Hydra
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: readonly BoardEntity[] = [
			buildBoardEntity('BGS_004', cards, 2), // Wrath Weaver, will attack first and die
			buildBoardEntity('BGS_043', cards, 3), // Murozond, who will die from the cleave
			buildBoardEntity('BGS_039', cards, 4), // Dragonspawn Lieutenant, who will tank the Hydra's attack, die and not kill the Hydra
			buildBoardEntity('BGS_043', cards, 5), // Murozond, who will die from the cleave
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
