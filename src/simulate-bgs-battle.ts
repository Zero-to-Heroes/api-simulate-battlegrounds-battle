/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds } from '@firestone-hs/reference-data';
import { BgsBattleInfo } from './bgs-battle-info';
import { BoardEntity } from './board-entity';
import { CardsData } from './cards/cards-data';
import { SimulationResult } from './simulation-result';
import { removeAuras } from './simulation/auras';
import { removeGlobalModifiers } from './simulation/global-modifiers';
import { Simulator } from './simulation/simulator';
import { Spectator } from './simulation/spectator/spectator';
import { addImpliedMechanics } from './utils';

const cards = new AllCardsService();

// This example demonstrates a NodeJS 8.10 async handler[1], however of course you could use
// the more traditional callback-style handler.
// [1]: https://aws.amazon.com/blogs/compute/node-js-8-10-runtime-now-available-in-aws-lambda/
export default async (event): Promise<any> => {
	const battleInput: BgsBattleInfo = JSON.parse(event.body);
	await cards.initializeCardsDb('81706');
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

	const maxAcceptableDuration = battleInput.options?.maxAcceptableDuration || 6000;
	const numberOfSimulations = battleInput.options?.numberOfSimulations || 2500;

	const simulationResult: SimulationResult = {
		won: 0,
		tied: 0,
		lost: 0,
		damageWon: 0,
		damageLost: 0,
		wonPercent: undefined,
		tiedPercent: undefined,
		lostPercent: undefined,
		averageDamageWon: undefined,
		averageDamageLost: undefined,
	};

	const playerInfo = battleInput.playerBoard;
	const opponentInfo = battleInput.opponentBoard;

	const playerBoard = playerInfo.board.map((entity) => ({ ...addImpliedMechanics(entity), friendly: true } as BoardEntity));
	const opponentBoard = opponentInfo.board.map((entity) => ({ ...addImpliedMechanics(entity), friendly: false } as BoardEntity));
	removeAuras(playerBoard, cardsData); // cleanEnchantments(playerInfo.board);
	removeAuras(opponentBoard, cardsData); // cleanEnchantments(opponentInfo.board);
	removeGlobalModifiers(playerBoard, opponentBoard, cards);

	// We do this so that we can have mutated objects inside the simulation and still
	// be able to start from a fresh copy for each simulation
	const inputReady = JSON.stringify({
		playerBoard: {
			board: playerBoard,
			player: playerInfo.player,
		},
		opponentBoard: {
			board: opponentBoard,
			player: opponentInfo.player,
		},
	});
	const spectator = new Spectator(
		battleInput.playerBoard.player.cardId,
		battleInput.playerBoard.player.heroPowerId,
		battleInput.opponentBoard.player.cardId,
		battleInput.opponentBoard.player.heroPowerId,
	);
	console.time('simulation');
	for (let i = 0; i < numberOfSimulations; i++) {
		const simulator = new Simulator(cards, cardsData);
		const input = JSON.parse(inputReady);
		const battleResult = simulator.simulateSingleBattle(
			input.playerBoard.board,
			input.playerBoard.player,
			input.opponentBoard.board,
			input.opponentBoard.player,
			spectator,
		);
		if (!battleResult) {
			continue;
		}
		if (Date.now() - start > maxAcceptableDuration) {
			// Can happen in case of inifinite boards, or a bug. Don't hog the user's computer in that case
			console.warn('Stopping simulation after', i, 'iterations and ', Date.now() - start, 'ms', battleResult);
			break;
		}
		if (battleResult.result === 'won') {
			simulationResult.won++;
			simulationResult.damageWon += battleResult.damageDealt;
			if (!battleResult.damageDealt || battleResult.damageDealt === NaN) {
				// console.debug('no damage dealt', battleResult);
			}
		} else if (battleResult.result === 'lost') {
			simulationResult.lost++;
			simulationResult.damageLost += battleResult.damageDealt;
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
	CardIds.NonCollectible.Neutral.ReplicatingMenace_ReplicatingMenaceEnchantment,
	CardIds.NonCollectible.Neutral.ReplicatingMenace_ReplicatingMenaceEnchantmentTavernBrawl,
	CardIds.NonCollectible.Neutral.LivingSporesToken2,
];

const cleanEnchantmentsForEntity = (
	enchantments: { cardId: string; originEntityId: number }[],
	entityIds: readonly number[],
): { cardId: string; originEntityId: number }[] => {
	return enchantments.filter(
		(enchant) => entityIds.indexOf(enchant.originEntityId) !== -1 || validEnchantments.indexOf(enchant.cardId) !== -1,
	);
};
