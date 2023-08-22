/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService, CardIds } from '@firestone-hs/reference-data';
import { BgsBattleInfo } from './bgs-battle-info';
import { BoardEntity } from './board-entity';
import { CardsData } from './cards/cards-data';
import { SimulationResult } from './simulation-result';
import { setImplicitDataHero, setMissingAuras } from './simulation/auras';
import { Simulator } from './simulation/simulator';
import { Spectator } from './simulation/spectator/spectator';
import { addImpliedMechanics } from './utils';

const cards = new AllCardsService();

// This example demonstrates a NodeJS 8.10 async handler[1], however of course you could use
// the more traditional callback-style handler.
// [1]: https://aws.amazon.com/blogs/compute/node-js-8-10-runtime-now-available-in-aws-lambda/
export default async (event): Promise<any> => {
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

	const playerBoard = playerInfo.board.map(
		(entity) => ({ ...addImpliedMechanics(entity, cardsData), friendly: true } as BoardEntity),
	);
	const opponentBoard = opponentInfo.board.map(
		(entity) => ({ ...addImpliedMechanics(entity, cardsData), friendly: false } as BoardEntity),
	);
	// When using the simulator, the aura is not applied when receiving the board state. When
	setMissingAuras(playerBoard, playerInfo.player, opponentInfo.player, cards);
	setMissingAuras(opponentBoard, opponentInfo.player, playerInfo.player, cards);
	// Avenge, maxHealth, etc.
	// setImplicitData(playerBoard, cardsData);
	// setImplicitData(opponentBoard, cardsData);
	// Avenge, globalInfo
	setImplicitDataHero(playerInfo.player, cardsData, true);
	setImplicitDataHero(opponentInfo.player, cardsData, false);

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
	!battleInput.options?.skipInfoLogs && console.time('simulation');
	const outcomes = {};
	for (let i = 0; i < numberOfSimulations; i++) {
		const simulator = new Simulator(cards, cardsData);
		const input: BgsBattleInfo = JSON.parse(inputStr);
		const battleResult = simulator.simulateSingleBattle(
			input.playerBoard.board,
			input.playerBoard.player,
			input.opponentBoard.board,
			input.opponentBoard.player,
			input.gameState,
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
	if (simulationResult.averageDamageWon > 0 && simulationResult.averageDamageWon < playerInfo.player.tavernTier) {
		console.warn('average damage won issue', simulationResult, playerInfo);
	}
	if (simulationResult.averageDamageLost > 0 && simulationResult.averageDamageLost < opponentInfo.player.tavernTier) {
		console.warn('average damage lost issue', simulationResult, opponentInfo);
	}
	!battleInput.options?.skipInfoLogs && console.timeEnd('simulation');
	spectator.prune();
	simulationResult.outcomeSamples = spectator.buildOutcomeSamples();
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
];

const cleanEnchantmentsForEntity = (
	enchantments: { cardId: string; originEntityId?: number; timing: number }[],
	entityIds: readonly number[],
): { cardId: string; originEntityId?: number; timing: number }[] => {
	return enchantments.filter(
		(enchant) =>
			entityIds.indexOf(enchant.originEntityId) !== -1 ||
			validEnchantments.indexOf(enchant.cardId as CardIds) !== -1,
	);
};
