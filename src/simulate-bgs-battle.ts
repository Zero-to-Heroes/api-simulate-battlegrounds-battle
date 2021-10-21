/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds } from '@firestone-hs/reference-data';
import { BgsBattleInfo } from './bgs-battle-info';
import { BoardEntity } from './board-entity';
import { CardsData } from './cards/cards-data';
import { SimulationResult } from './simulation-result';
import { removeAuras, setImplicitData } from './simulation/auras';
import { Simulator } from './simulation/simulator';
import { Spectator } from './simulation/spectator/spectator';
import { addImpliedMechanics } from './utils';

const cards = new AllCardsService();

// This example demonstrates a NodeJS 8.10 async handler[1], however of course you could use
// the more traditional callback-style handler.
// [1]: https://aws.amazon.com/blogs/compute/node-js-8-10-runtime-now-available-in-aws-lambda/
export default async (event): Promise<any> => {
	const battleInput: BgsBattleInfo = JSON.parse(event.body);
	await cards.initializeCardsDb('121569');
	const cardsData = new CardsData(cards, false);
	cardsData.inititialize(battleInput.options?.validTribes);
	const simulationResult = simulateBattle(battleInput, cards, cardsData);

	const response = {
		statusCode: 200,
		isBase64Encoded: false,
		body: JSON.stringify(simulationResult),
	};
	return response;
};

export const simulateBattle = (battleInput: BgsBattleInfo, cards: AllCardsService, cardsData: CardsData): SimulationResult => {
	const start = Date.now();

	const maxAcceptableDuration = battleInput.options?.maxAcceptableDuration || 8000;
	const numberOfSimulations = battleInput.options?.numberOfSimulations || 5000;

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

	const playerInfo = battleInput.playerBoard;
	const opponentInfo = battleInput.opponentBoard;

	const playerBoard = playerInfo.board.map((entity) => ({ ...addImpliedMechanics(entity), friendly: true } as BoardEntity));
	const opponentBoard = opponentInfo.board.map((entity) => ({ ...addImpliedMechanics(entity), friendly: false } as BoardEntity));
	removeAuras(playerBoard, cardsData);
	removeAuras(opponentBoard, cardsData);
	setImplicitData(playerBoard, cardsData); // Avenge, maxHealth, etc.
	setImplicitData(opponentBoard, cardsData); // Avenge, maxHealth, etc.

	// We do this so that we can have mutated objects inside the simulation and still
	// be able to start from a fresh copy for each simulation
	const inputReady: BgsBattleInfo = {
		playerBoard: {
			board: playerBoard,
			player: playerInfo.player,
		},
		opponentBoard: {
			board: opponentBoard,
			player: opponentInfo.player,
		},
	} as BgsBattleInfo;
	const inputStr = JSON.stringify(inputReady);
	const spectator = new Spectator(
		battleInput.playerBoard.player.cardId,
		battleInput.playerBoard.player.heroPowerId,
		battleInput.opponentBoard.player.cardId,
		battleInput.opponentBoard.player.heroPowerId,
	);
	console.time('simulation');
	for (let i = 0; i < numberOfSimulations; i++) {
		// global.gc();
		// continue;
		const simulator = new Simulator(cards, cardsData);
		const input: BgsBattleInfo = JSON.parse(inputStr);
		const battleResult = simulator.simulateSingleBattle(
			input.playerBoard.board,
			input.playerBoard.player,
			input.opponentBoard.board,
			input.opponentBoard.player,
			spectator,
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
			if (battleInput.playerBoard.player.hpLeft && battleResult.damageDealt >= battleInput.playerBoard.player.hpLeft) {
				simulationResult.lostLethal++;
			}
		} else if (battleResult.result === 'tied') {
			simulationResult.tied++;
		}
		spectator.commitBattleResult(battleResult.result);
	}
	const totalMatches = simulationResult.won + simulationResult.tied + simulationResult.lost;
	simulationResult.wonPercent = checkRounding(
		Math.round((10 * (100 * simulationResult.won)) / totalMatches) / 10,
		simulationResult.won,
		totalMatches,
	);
	simulationResult.lostPercent = checkRounding(
		Math.round((10 * (100 * simulationResult.lost)) / totalMatches) / 10,
		simulationResult.lost,
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
	simulationResult.averageDamageLost = simulationResult.lost ? simulationResult.damageLost / simulationResult.lost : 0;
	if (simulationResult.averageDamageWon > 0 && simulationResult.averageDamageWon < playerInfo.player.tavernTier) {
		console.warn('average damage won issue', simulationResult, playerInfo);
	}
	if (simulationResult.averageDamageLost > 0 && simulationResult.averageDamageLost < opponentInfo.player.tavernTier) {
		console.warn('average damage lost issue', simulationResult, opponentInfo);
	}
	console.timeEnd('simulation');
	spectator.prune();
	simulationResult.outcomeSamples = spectator.buildOutcomeSamples();
	// spectator.reset();
	return simulationResult;
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

const cleanEnchantments = (board: readonly BoardEntity[]): readonly BoardEntity[] => {
	const entityIds = board.map((entity) => entity.entityId);
	return board.map((entity) => ({
		...entity,
		enchantments: cleanEnchantmentsForEntity(entity.enchantments, entityIds),
	}));
};

export const validEnchantments = [
	CardIds.ReplicatingMenace_ReplicatingMenaceEnchantment,
	CardIds.ReplicatingMenace_ReplicatingMenaceEnchantmentBattlegrounds,
	CardIds.LivingSpores_LivingSporesEnchantment,
	CardIds.Leapfrogger_LeapfrogginEnchantment1,
	CardIds.Leapfrogger_LeapfrogginEnchantment2,
];

const cleanEnchantmentsForEntity = (
	enchantments: { cardId: string; originEntityId: number }[],
	entityIds: readonly number[],
): { cardId: string; originEntityId: number }[] => {
	return enchantments.filter(
		(enchant) => entityIds.indexOf(enchant.originEntityId) !== -1 || validEnchantments.indexOf(enchant.cardId as CardIds) !== -1,
	);
};
