import { AllCardsService, CardIds } from '@firestone-hs/reference-data';
import { BgsBattleInfo } from '../../src/bgs-battle-info';
import { BgsPlayerEntity } from '../../src/bgs-player-entity';
import { BoardEntity } from '../../src/board-entity';
import { CardsData } from '../../src/cards/cards-data';
import { simulateBattle } from '../../src/simulate-bgs-battle';
import { Simulator } from '../../src/simulation/simulator';
import { GameSample } from '../../src/simulation/spectator/game-sample';
import { buildSingleBoardEntity, fromBase64, toBase64 } from '../../src/utils';
import cardsJson from '../cards.json';

describe('Deathrattle random order', () => {
	test('First board to trigger deathrattles is chosen randomly', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);
		const sharedState = simulator['sharedState'];

		const playerBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.KaboomBot,
					cards,
					true,
					sharedState.currentEntityId++,
				),
				attack: 4,
				health: 2,
			},
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Hunter.Alleycat,
					cards,
					true,
					sharedState.currentEntityId++,
				),
			},
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Hunter.MetaltoothLeaper,
					cards,
					true,
					sharedState.currentEntityId++,
				),
			},
		];
		const playerEntity: BgsPlayerEntity = {
			tavernTier: 1,
			cardId: 'TB_BaconShop_HERO_10',
			heroPowerId: 'TB_BaconShop_HP_068',
		} as BgsPlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Neutral.StewardOfTime,
					cards,
					false,
					sharedState.currentEntityId++,
				),
			},
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Neutral.Imprisoner,
					cards,
					false,
					sharedState.currentEntityId++,
				),
			},
		];
		const opponentEntity: BgsPlayerEntity = {
			tavernTier: 1,
			cardId: 'TB_BaconShop_HERO_10',
			heroPowerId: 'TB_BaconShop_HP_068',
		} as BgsPlayerEntity;

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
				numberOfSimulations: 10,
				maxAcceptableDuration: 2000,
			},
		};
		// sharedState.debug = true;
		const result = simulateBattle(battleInput, cards, spawns);

		expect(result).not.toBeNull();
		// expect(result.wonPercent).toBeGreaterThan(74);
		// expect(result.wonPercent).toBeLessThan(76);

		expect(result.outcomeSamples.tied).not.toBeNull();
		expect(result.outcomeSamples.tied.length).toBeGreaterThanOrEqual(1);

		const sample: GameSample = result.outcomeSamples.tied[0];
		console.log('sample', JSON.stringify(sample));
		const base64 = toBase64(JSON.stringify(sample));
		console.log('encoded', base64);
		const decoded = fromBase64(base64);
		expect(base64).toEqual(toBase64(decoded));
	});
});

function buildCardsService() {
	const service = new AllCardsService();
	service['allCards'] = [...(cardsJson as any[])];
	return service;
}
