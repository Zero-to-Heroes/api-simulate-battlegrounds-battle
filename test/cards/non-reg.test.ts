import { AllCardsService, CardIds } from '@firestone-hs/reference-data';
import { BgsBattleInfo } from '../../src/bgs-battle-info';
import { BgsPlayerEntity } from '../../src/bgs-player-entity';
import { BoardEntity } from '../../src/board-entity';
import { CardsData } from '../../src/cards/cards-data';
import { simulateBattle } from '../../src/simulate-bgs-battle';
import { SharedState } from '../../src/simulation/shared-state';
import { Simulator } from '../../src/simulation/simulator';
import { buildSingleBoardEntity } from '../../src/utils';
import cardsJson from '../cards.json';

describe('Non-reg', () => {
	test('hop', async () => {
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
				attack: 7,
				health: 6,
			},
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.OldMurkEye,
					cards,
					true,
					sharedState.currentEntityId++,
				),
				attack: 4,
				health: 6,
			},
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.Zoobot,
					cards,
					true,
					sharedState.currentEntityId++,
				),
				attack: 4,
				health: 4,
			},
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Hunter.RatPack,
					cards,
					true,
					sharedState.currentEntityId++,
				),
				attack: 3,
				health: 3,
			},
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Hunter.RatPack,
					cards,
					true,
					sharedState.currentEntityId++,
				),
				attack: 2,
				health: 2,
			},
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Neutral.Imprisoner,
					cards,
					true,
					sharedState.currentEntityId++,
				),
				attack: 3,
				health: 3,
			},
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Paladin.RighteousProtector,
					cards,
					true,
					sharedState.currentEntityId++,
				),
				attack: 2,
				health: 2,
			},
		];
		const playerEntity: BgsPlayerEntity = { tavernTier: 1 } as BgsPlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.MurlocTidehunter,
					cards,
					false,
					sharedState.currentEntityId++,
				),
				attack: 2,
				health: 3,
			},
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.MurlocTidehunter,
					cards,
					false,
					sharedState.currentEntityId++,
				),
				attack: 4,
				health: 5,
			},
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.RockpoolHunter,
					cards,
					false,
					sharedState.currentEntityId++,
				),
				attack: 2,
				health: 5,
			},
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.RockpoolHunter,
					cards,
					false,
					sharedState.currentEntityId++,
				),
				attack: 2,
				health: 5,
			},
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.ColdlightSeer,
					cards,
					false,
					sharedState.currentEntityId++,
				),
				attack: 2,
				health: 3,
			},
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Neutral.YoHoOgre,
					cards,
					false,
					sharedState.currentEntityId++,
				),
				attack: 4,
				health: 16,
			},
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Neutral.RipsnarlCaptain,
					cards,
					false,
					sharedState.currentEntityId++,
				),
				attack: 3,
				health: 4,
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
				validTribes: [],
			},
		};
		SharedState.debugEnabled = true;
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
