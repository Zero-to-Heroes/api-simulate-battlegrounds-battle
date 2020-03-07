import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../src/board-entity';
import { AllCardsService } from '../src/cards/cards';
import { CardsData } from '../src/cards/cards-data';
import { PlayerEntity } from '../src/player-entity';
import { SharedState } from '../src/simulation/shared-state';
import { Simulator } from '../src/simulation/simulator';
import { buildSingleBoardEntity } from '../src/utils';
import cardsJson from './cards.json';

describe('Basic attributes', () => {
	const sharedState = new SharedState();

	test('Divine Shield works properly', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);
		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity('EX1_008', cards, 1), // Argent Squire
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			buildSingleBoardEntity('BGS_004', cards, 2), // Wrath Weaver
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(2);
	});

	test('Deathrattle summon works properly', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);
		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity('BOT_445', cards, 1), // Mecharoo
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			buildSingleBoardEntity('BGS_004', cards, 2), // Wrath Weaver
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(2);
	});

	test('Taunt works properly', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity('BGS_004', cards, 1), // Wrath Weaver
			buildSingleBoardEntity('BGS_004', cards, 2), // Wrath Weaver
			buildSingleBoardEntity('BGS_004', cards, 3), // Wrath Weaver
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			buildSingleBoardEntity('BGS_039', cards, 4), // Dragonspawn Lieutenant
			buildSingleBoardEntity('BGS_028', cards, 5), // Pogo
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		// The player will attack first always, and never kill the Pogo, thus always taking 3 damage
		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('lost');
		expect(result.damageDealt).toBe(3);
	}, 10000);

	test('Reborn works properly', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity('BGS_034', cards, 1), // Bronze Warden
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			buildSingleBoardEntity('BGS_028', cards, 5), // Pogo
			buildSingleBoardEntity('BGS_028', cards, 6), // Pogo
			buildSingleBoardEntity('BGS_028', cards, 7), // Pogo
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(4);
	});

	test('Poisonous one-shots any non-divine shield minion', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity(CardIds.Collectible.Neutral.Maexxna, cards, sharedState.currentEntityId++),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.RockpoolHunter,
					cards,
					sharedState.currentEntityId++,
				),
				health: 999,
				attack: 999,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('tied');
	});

	test('Poisonous does not work on divine shield minion', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			buildSingleBoardEntity(CardIds.Collectible.Neutral.Maexxna, cards, sharedState.currentEntityId++),
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.RockpoolHunter,
					cards,
					sharedState.currentEntityId++,
				),
				divineShield: true,
				health: 999,
				attack: 999,
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('lost');
	});

	test('Cleave works properly', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);
		const playerBoard: BoardEntity[] = [
			{ ...buildSingleBoardEntity('LOOT_078', cards, 1), attack: 10 } as BoardEntity, // Cave Hydra
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			buildSingleBoardEntity('BGS_004', cards, 2), // Wrath Weaver, will attack first and die
			buildSingleBoardEntity('BGS_043', cards, 3), // Murozond, who will die from the cleave
			buildSingleBoardEntity('BGS_039', cards, 4), // Dragonspawn Lieutenant, who will tank the Hydra's attack, die and not kill the Hydra
			buildSingleBoardEntity('BGS_043', cards, 5), // Murozond, who will die from the cleave
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
		expect(result.damageDealt).toBe(5);
	});

	test('Windfury works properly', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.RockpoolHunter,
					cards,
					sharedState.currentEntityId++,
				),
				windfury: true,
				attack: 4,
				health: 8,
			},
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.RockpoolHunter,
					cards,
					sharedState.currentEntityId++,
				),
				taunt: true,
				health: 5,
			},
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Mage.GlyphGuardianBATTLEGROUNDS,
					cards,
					sharedState.currentEntityId++,
				),
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('won');
	});

	test('Windfury has only one attack if attacker is dead after first', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.RockpoolHunter,
					cards,
					sharedState.currentEntityId++,
				),
				windfury: true,
				attack: 4,
				health: 4,
			},
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.RockpoolHunter,
					cards,
					sharedState.currentEntityId++,
				),
				taunt: true,
				health: 5,
			},
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Mage.GlyphGuardianBATTLEGROUNDS,
					cards,
					sharedState.currentEntityId++,
				),
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('lost');
	});

	test('Damage between windfury attacks carry over', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.RockpoolHunter,
					cards,
					sharedState.currentEntityId++,
				),
				windfury: true,
				attack: 4,
				health: 6,
			},
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.RockpoolHunter,
					cards,
					sharedState.currentEntityId++,
				),
				taunt: true,
				health: 5,
			},
			{
				...buildSingleBoardEntity(
					CardIds.NonCollectible.Mage.GlyphGuardianBATTLEGROUNDS,
					cards,
					sharedState.currentEntityId++,
				),
			},
		];
		const opponentEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;

		const result = simulator.simulateSingleBattle(playerBoard, playerEntity, opponentBoard, opponentEntity);

		expect(result).not.toBeNull();
		expect(result.result).toBe('tied');
	});

	test('Mega-windfury works properly', async () => {
		const cards = buildCardsService();
		await cards.initializeCardsDb();
		const spawns = new CardsData(cards);
		const simulator = new Simulator(cards, spawns);

		const playerBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.RockpoolHunter,
					cards,
					sharedState.currentEntityId++,
				),
				megaWindfury: true,
				attack: 4,
				health: 12,
			},
		];
		const playerEntity: PlayerEntity = { tavernTier: 1 } as PlayerEntity;
		const opponentBoard: BoardEntity[] = [
			{
				...buildSingleBoardEntity(
					CardIds.Collectible.Neutral.RockpoolHunter,
					cards,
					sharedState.currentEntityId++,
				),
				taunt: true,
				health: 5,
			},
			buildSingleBoardEntity(
				CardIds.NonCollectible.Mage.GlyphGuardianBATTLEGROUNDS,
				cards,
				sharedState.currentEntityId++,
			),
			buildSingleBoardEntity(
				CardIds.NonCollectible.Mage.GlyphGuardianBATTLEGROUNDS,
				cards,
				sharedState.currentEntityId++,
			),
			buildSingleBoardEntity(
				CardIds.NonCollectible.Mage.GlyphGuardianBATTLEGROUNDS,
				cards,
				sharedState.currentEntityId++,
			),
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
