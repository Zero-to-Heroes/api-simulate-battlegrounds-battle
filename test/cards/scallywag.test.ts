import { AllCardsService, CardIds } from '@firestone-hs/reference-data';
import { BgsBattleInfo } from '../../src/bgs-battle-info';
import { BgsPlayerEntity } from '../../src/bgs-player-entity';
import { BoardEntity } from '../../src/board-entity';
import { CardsData } from '../../src/cards/cards-data';
import { simulateBattle } from '../../src/simulate-bgs-battle';
import { Simulator } from '../../src/simulation/simulator';
import { Spectator } from '../../src/simulation/spectator/spectator';
import { buildSingleBoardEntity } from '../../src/utils';
import cardsJson from '../cards.json';

describe('Scallywag', () => {
	test('Scallywag spawn attacks immediately', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			{ ...buildSingleBoardEntity(CardIds.NonCollectible.Neutral.Scallywag, cards, true, 1) },
			{
				...buildSingleBoardEntity(CardIds.NonCollectible.Neutral.KalecgosArcaneAspect, cards, true, 1),
				taunt: true,
				health: 1,
			},
		];
		const playerEntity: BgsPlayerEntity = { tavernTier: 1 } as BgsPlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{ ...buildSingleBoardEntity(CardIds.NonCollectible.Neutral.DragonspawnLieutenant, cards, false, 1) },
		];
		const opponentEntity: BgsPlayerEntity = { tavernTier: 1 } as BgsPlayerEntity;

		const result = simulator.simulateSingleBattle(
			playerBoard,
			playerEntity,
			opponentBoard,
			opponentEntity,
			new Spectator(null, null, null, null),
		);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(7);
	});
	// This case is not handled yet (see attack.ts, ~line 700)
	test.skip('Scallywag spawn attacks immediately - 2', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);
		const sharedState = simulator['sharedState'];

		const playerBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Hunter.RabidSauroliskBATTLEGROUNDS,
					cards,
					true,
					sharedState.currentEntityId++,
				),
				attack: 4,
				health: 3,
			},
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Neutral.Scallywag,
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
					CardIds.Collectible.Paladin.SelflessHero,
					cards,
					false,
					sharedState.currentEntityId++,
				),
			},
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Neutral.Scallywag,
					cards,
					false,
					sharedState.currentEntityId++,
				),
			},
		];
		const opponentEntity: BgsPlayerEntity = { tavernTier: 1 } as BgsPlayerEntity;

		const battleInput: BgsBattleInfo = {
			playerBoard: {
				board: playerBoard,
				player: playerEntity,
			},
			opponentBoard: {
				board: opponentBoard,
				player: opponentEntity,
			},
			options: {
				numberOfSimulations: 1,
				maxAcceptableDuration: 2000,
			},
		};
		sharedState.debug = true;
		const result = simulateBattle(battleInput, cards, spawns);

		expect(result).not.toBeNull();
		expect(result.wonPercent).toBeGreaterThan(74);
		expect(result.wonPercent).toBeLessThan(76);
	});
});

function buildCardsService() {
	const service = new AllCardsService();
	service['allCards'] = [...(cardsJson as any[])];
	return service;
}
