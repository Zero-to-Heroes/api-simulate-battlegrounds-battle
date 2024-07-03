/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds } from '@firestone-hs/reference-data';
import { BgsBattleInfo } from './bgs-battle-info';
import { CardsData } from './cards/cards-data';
import { cloneInput3 } from './input-clone';
import { buildFinalInput } from './input-sanitation';
import { SimulationResult } from './simulation-result';
import { FullGameState } from './simulation/internal-game-state';
import { SharedState } from './simulation/shared-state';
import { Simulator } from './simulation/simulator';
import { Spectator } from './simulation/spectator/spectator';

let globalCards = new AllCardsService();

export const assignCards = (cards: AllCardsService) => {
	globalCards = cards;
};

// This example demonstrates a NodeJS 8.10 async handler[1], however of course you could use
// the more traditional callback-style handler.
// [1]: https://aws.amazon.com/blogs/compute/node-js-8-10-runtime-now-available-in-aws-lambda/
export default async (event): Promise<any> => {
	if (!event.body?.length) {
		console.warn('missing event body', event);
		return;
	}

	const battleInput: BgsBattleInfo = JSON.parse(event.body);
	const cards = globalCards;
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

	const spectator = new Spectator();
	const inputReady = buildFinalInput(battleInput, cards, cardsData);
	!battleInput.options?.skipInfoLogs && console.time('simulation');
	const outcomes = {};
	for (let i = 0; i < numberOfSimulations; i++) {
		const input: BgsBattleInfo = cloneInput3(inputReady);
		const inputClone: BgsBattleInfo = cloneInput3(inputReady);
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
					teammate: input.playerTeammateBoard,
				},
				opponent: {
					player: input.opponentBoard.player,
					board: input.opponentBoard.board,
					teammate: input.opponentTeammateBoard,
				},
				playerInitial: {
					player: inputClone.playerBoard.player,
					board: inputClone.playerBoard.board,
					teammate: inputClone.playerTeammateBoard,
				},
				opponentInitial: {
					player: inputClone.opponentBoard.player,
					board: inputClone.opponentBoard.board,
					teammate: inputClone.opponentTeammateBoard,
				},
			},
		};
		const simulator = new Simulator(gameState);
		const battleResult = simulator.simulateSingleBattle(gameState.gameState.player, gameState.gameState.opponent);
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

// Used when triggering random deathrattles
export const VALID_DEATHRATTLE_ENCHANTMENTS = [
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
