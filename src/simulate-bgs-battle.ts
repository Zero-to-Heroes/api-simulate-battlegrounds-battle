/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds } from '@firestone-hs/reference-data';
import { BgsBattleInfo } from './bgs-battle-info';
import { BgsBoardInfo } from './bgs-board-info';
import { BoardEntity } from './board-entity';
import { CardsData } from './cards/cards-data';
import { SimulationResult } from './simulation-result';
import { setImplicitDataHero, setMissingAuras } from './simulation/auras';
import { fixEnchantments } from './simulation/enchantments';
import { FullGameState } from './simulation/internal-game-state';
import { SharedState } from './simulation/shared-state';
import { Simulator } from './simulation/simulator';
import { Spectator } from './simulation/spectator/spectator';
import { addImpliedMechanics } from './utils';

const cards = new AllCardsService();

// This example demonstrates a NodeJS 8.10 async handler[1], however of course you could use
// the more traditional callback-style handler.
// [1]: https://aws.amazon.com/blogs/compute/node-js-8-10-runtime-now-available-in-aws-lambda/
export default async (event): Promise<any> => {
	if (!event.body?.length) {
		console.warn('missing event body', event);
		return;
	}

	const battleInput: BgsBattleInfo = JSON.parse(event.body);
	await cards.initializeCardsDb();
	const cardsData = new CardsData(cards, false);
	cardsData.inititialize(
		battleInput.gameState?.validTribes ?? battleInput.options?.validTribes,
		battleInput.gameState?.anomalies ?? [],
	);
	const simulationResult = simulateBattle(battleInput, cards, cardsData);

	const response = {
		statusCode: 200,
		isBase64Encoded: false,
		body: JSON.stringify(simulationResult),
	};
	return response;
};

export const simulateBattle = (
	battleInput: BgsBattleInfo,
	cards: AllCardsService,
	cardsData: CardsData,
): SimulationResult => {
	// !battleInput.options?.skipInfoLogs && console.time('full-sim');
	const start = Date.now();
	const maxAcceptableDuration = battleInput.options?.maxAcceptableDuration || 8000;
	const numberOfSimulations = battleInput.options?.numberOfSimulations || 8000;
	const simulationResult: SimulationResult = {
		wonLethal: 0,
		won: 0,
		tied: 0,
		lost: 0,
		lostLethal: 0,
		damageWon: 0,
		damageLost: 0,
		wonLethalPercent: undefined,
		wonPercent: undefined,
		tiedPercent: undefined,
		lostPercent: undefined,
		lostLethalPercent: undefined,
		averageDamageWon: undefined,
		averageDamageLost: undefined,
	};

	const spectator = new Spectator(battleInput);
	const inputReady = buildFinalInput(battleInput, cards, cardsData);
	// const inputStr = JSON.stringify(inputReady);
	!battleInput.options?.skipInfoLogs && console.time('simulation');
	const outcomes = {};
	for (let i = 0; i < numberOfSimulations; i++) {
		const input: BgsBattleInfo = cloneInput3(inputReady);
		const gameState: FullGameState = {
			allCards: cards,
			cardsData: cardsData,
			spectator: spectator,
			sharedState: new SharedState(),
			currentTurn: input.gameState.currentTurn,
			validTribes: input.gameState.validTribes,
			anomalies: input.gameState.anomalies,
			gameState: {
				player: {
					player: input.playerBoard.player,
					board: input.playerBoard.board,
				},
				opponent: {
					player: input.opponentBoard.player,
					board: input.opponentBoard.board,
				},
			},
		};
		const simulator = new Simulator(gameState);
		const battleResult = simulator.simulateSingleBattle(
			input.playerBoard.board,
			input.playerBoard.player,
			input.opponentBoard.board,
			input.opponentBoard.player,
		);
		if (Date.now() - start > maxAcceptableDuration) {
			// Can happen in case of inifinite boards, or a bug. Don't hog the user's computer in that case
			console.warn('Stopping simulation after', i, 'iterations and ', Date.now() - start, 'ms', battleResult);
			break;
		}
		if (!battleResult) {
			continue;
		}
		if (battleResult.result === 'won') {
			simulationResult.won++;
			simulationResult.damageWon += battleResult.damageDealt;
			if (battleResult.damageDealt >= battleInput.opponentBoard.player.hpLeft) {
				simulationResult.wonLethal++;
			}
		} else if (battleResult.result === 'lost') {
			simulationResult.lost++;
			simulationResult.damageLost += battleResult.damageDealt;
			outcomes[battleResult.damageDealt] = (outcomes[battleResult.damageDealt] ?? 0) + 1;
			if (
				battleInput.playerBoard.player.hpLeft &&
				battleResult.damageDealt >= battleInput.playerBoard.player.hpLeft
			) {
				simulationResult.lostLethal++;
			}
		} else if (battleResult.result === 'tied') {
			simulationResult.tied++;
		}
		spectator.commitBattleResult(battleResult.result);
	}
	updateSimulationResult(simulationResult, inputReady);
	!battleInput.options?.skipInfoLogs && console.timeEnd('simulation');
	spectator.prune();
	simulationResult.outcomeSamples = spectator.buildOutcomeSamples();
	// !battleInput.options?.skipInfoLogs && console.timeEnd('full-sim');
	return simulationResult;
};

// const cloneInput = (input: BgsBattleInfo): BgsBattleInfo => {
// 	return structuredClone(input);
// };
// const cloneInput2 = (input: string): BgsBattleInfo => {
// 	return JSON.parse(input);
// };
const cloneInput3 = (input: BgsBattleInfo): BgsBattleInfo => {
	const result: BgsBattleInfo = {
		gameState: {
			currentTurn: input.gameState.currentTurn,
			anomalies: input.gameState.anomalies,
			validTribes: input.gameState.validTribes,
		},
		heroHasDied: input.heroHasDied,
		playerBoard: cloneBoard(input.playerBoard),
		opponentBoard: cloneBoard(input.opponentBoard),
		options: null,
	};
	return result;
};
const cloneBoard = (board: BgsBoardInfo): BgsBoardInfo => {
	const result: BgsBoardInfo = {
		player: {
			...board.player,
			questEntities: board.player.questEntities?.map((quest) => ({ ...quest })),
			questRewardEntities: board.player.questRewardEntities?.map((reward) => ({ ...reward })),
			questRewards: board.player.questRewards?.map((reward) => reward),
			hand: board.player.hand?.map((entity) => cloneEntity(entity)),
			secrets: board.player.secrets?.map((secret) => ({ ...secret })),
			globalInfo: { ...board.player.globalInfo },
		},
		board: board.board.map((entity) => cloneEntity(entity)),
	};
	return result;
};
const cloneEntity = (entity: BoardEntity): BoardEntity => {
	const result: BoardEntity = {
		...entity,
		enchantments: entity.enchantments?.map((enchant) => ({ ...enchant })),
	};
	return result;
};

const buildFinalInput = (battleInput: BgsBattleInfo, cards: AllCardsService, cardsData: CardsData): BgsBattleInfo => {
	const playerInfo = battleInput.playerBoard;
	const opponentInfo = battleInput.opponentBoard;

	const playerBoard = playerInfo.board
		.map((entity) => fixEnchantments(entity, cards))
		.map((entity) => ({ ...entity, inInitialState: true }))
		.map((entity) => ({ ...addImpliedMechanics(entity, cardsData), friendly: true } as BoardEntity));
	const playerHand =
		playerInfo.player.hand
			?.map((entity) => ({ ...entity, inInitialState: true }))
			.map((entity) => ({ ...addImpliedMechanics(entity, cardsData), friendly: true } as BoardEntity)) ?? [];
	playerInfo.player.secrets = playerInfo.secrets?.filter((e) => !!e?.cardId);
	playerInfo.player.friendly = true;

	const opponentBoard = opponentInfo.board
		.map((entity) => fixEnchantments(entity, cards))
		.map((entity) => ({ ...entity, inInitialState: true }))
		.map((entity) => ({ ...addImpliedMechanics(entity, cardsData), friendly: false } as BoardEntity));
	const opponentHand =
		opponentInfo.player.hand
			?.map((entity) => ({ ...entity, inInitialState: true }))
			.map((entity) => ({ ...addImpliedMechanics(entity, cardsData), friendly: false } as BoardEntity)) ?? [];
	opponentInfo.player.secrets = opponentInfo.secrets?.filter((e) => !!e?.cardId);
	opponentInfo.player.friendly = false;

	// When using the simulator, the aura is not applied when receiving the board state. When
	setMissingAuras(playerBoard, playerInfo.player, opponentInfo.player, cards);
	setMissingAuras(opponentBoard, opponentInfo.player, playerInfo.player, cards);
	// Avenge, maxHealth, etc.
	// setImplicitData(playerBoard, cardsData);
	// setImplicitData(opponentBoard, cardsData);
	// Avenge, globalInfo
	const entityIdContainer = { entityId: 999_999_999 };
	setImplicitDataHero(playerInfo.player, cardsData, true, entityIdContainer);
	setImplicitDataHero(opponentInfo.player, cardsData, false, entityIdContainer);

	// We do this so that we can have mutated objects inside the simulation and still
	// be able to start from a fresh copy for each simulation
	const inputReady: BgsBattleInfo = {
		playerBoard: {
			board: playerBoard,
			player: {
				...playerInfo.player,
				hand: playerHand,
			},
		},
		opponentBoard: {
			board: opponentBoard,
			player: {
				...opponentInfo.player,
				hand: opponentHand,
			},
		},
		gameState: battleInput.gameState,
	} as BgsBattleInfo;
	return inputReady;
};

const updateSimulationResult = (simulationResult: SimulationResult, input: BgsBattleInfo) => {
	const totalMatches = simulationResult.won + simulationResult.tied + simulationResult.lost;
	simulationResult.wonPercent = checkRounding(
		Math.round((10 * (100 * simulationResult.won)) / totalMatches) / 10,
		simulationResult.won,
		totalMatches,
	);
	simulationResult.wonLethalPercent = checkRounding(
		Math.round((10 * (100 * simulationResult.wonLethal)) / totalMatches) / 10,
		simulationResult.wonLethal,
		totalMatches,
	);
	simulationResult.lostPercent = checkRounding(
		Math.round((10 * (100 * simulationResult.lost)) / totalMatches) / 10,
		simulationResult.lost,
		totalMatches,
	);
	simulationResult.lostLethalPercent = checkRounding(
		Math.round((10 * (100 * simulationResult.lostLethal)) / totalMatches) / 10,
		simulationResult.lostLethal,
		totalMatches,
	);
	// simulationResult.tiedPercent = checkRounding(Math.round((10 * (100 * simulationResult.tied)) / totalMatches) / 10, simulationResult.tied, totalMatches);
	simulationResult.tiedPercent = checkRounding(
		100 - simulationResult.lostPercent - simulationResult.wonPercent,
		simulationResult.tied,
		totalMatches,
	);

	simulationResult.wonLethalPercent = Math.round((10 * (100 * simulationResult.wonLethal)) / totalMatches) / 10;
	simulationResult.lostLethalPercent = Math.round((10 * (100 * simulationResult.lostLethal)) / totalMatches) / 10;
	simulationResult.averageDamageWon = simulationResult.won ? simulationResult.damageWon / simulationResult.won : 0;
	simulationResult.averageDamageLost = simulationResult.lost
		? simulationResult.damageLost / simulationResult.lost
		: 0;
	if (
		simulationResult.averageDamageWon > 0 &&
		simulationResult.averageDamageWon < input.playerBoard.player.tavernTier
	) {
		console.warn('average damage won issue');
	}
	if (
		simulationResult.averageDamageLost > 0 &&
		simulationResult.averageDamageLost < input.opponentBoard.player.tavernTier
	) {
		console.warn('average damage lost issue', simulationResult);
	}
};

const checkRounding = (roundedValue: number, initialValue: number, totalValue: number): number => {
	if (roundedValue === 0 && initialValue !== 0) {
		return 0.01;
	}
	if (roundedValue === 100 && initialValue !== totalValue) {
		return 99.9;
	}
	return roundedValue;
};

// const cleanEnchantments = (board: readonly BoardEntity[]): readonly BoardEntity[] => {
// 	const entityIds = board.map((entity) => entity.entityId);
// 	return board.map((entity) => ({
// 		...entity,
// 		enchantments: cleanEnchantmentsForEntity(entity.enchantments, entityIds),
// 	}));
// };

// Used when triggering random deathrattles
export const VALID_ENCHANTMENTS = [
	CardIds.ReplicatingMenace_ReplicatingMenaceEnchantment_BG_BOT_312e,
	CardIds.ReplicatingMenace_ReplicatingMenaceEnchantment_TB_BaconUps_032e,
	CardIds.LivingSpores_LivingSporesEnchantment,
	CardIds.Leapfrogger_LeapfrogginEnchantment_BG21_000e,
	CardIds.Leapfrogger_LeapfrogginEnchantment_BG21_000_Ge,
	CardIds.Sneed_SneedsReplicator,
	CardIds.SneedsReplicator_ReplicateEnchantment,
	CardIds.EarthRecollectionEnchantment, // Spirit Raptor
	CardIds.FireRecollectionEnchantment,
	CardIds.LightningRecollectionEnchantment,
	CardIds.WaterRecollectionEnchantment,
	CardIds.EarthInvocation_ElementEarthEnchantment, // Summon a 1/1
	// CardIds.FireInvocation_ElementFireEnchantment, // Attack is doubled, probably no use to keep it
	// CardIds.WaterInvocation_ElementWaterEnchantment, // +3 health and taunt, same
	CardIds.LightningInvocation, // Deal 1 damage to 5 enemy minions
	CardIds.SurfNSurf_CrabRidingEnchantment_BG27_004e,
	CardIds.SurfNSurf_CrabRidingEnchantment_BG27_004_Ge,
	CardIds.RecurringNightmare_NightmareInsideEnchantment_BG26_055e,
	CardIds.RecurringNightmare_NightmareInsideEnchantment_BG26_055_Ge,
	CardIds.BoonOfBeetles_BeetleSwarmEnchantment_BG28_603e,
];

// const cleanEnchantmentsForEntity = (
// 	enchantments: { cardId: string; originEntityId?: number; timing: number }[],
// 	entityIds: readonly number[],
// ): { cardId: string; originEntityId?: number; timing: number }[] => {
// 	return enchantments.filter(
// 		(enchant) =>
// 			entityIds.indexOf(enchant.originEntityId) !== -1 ||
// 			validEnchantments.indexOf(enchant.cardId as CardIds) !== -1,
// 	);
// };
