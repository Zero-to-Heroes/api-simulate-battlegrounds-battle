/* eslint-disable @typescript-eslint/no-use-before-define */
import { CardIds } from '@firestone-hs/reference-data';
import { BgsBattleInfo } from './bgs-battle-info';
import { BoardEntity } from './board-entity';
import { AllCardsService } from './cards/cards';
import { CardsData } from './cards/cards-data';
import { Simulator } from './simulation/simulator';

const cards = new AllCardsService();
const cardsData = new CardsData(cards, false);

// This example demonstrates a NodeJS 8.10 async handler[1], however of course you could use
// the more traditional callback-style handler.
// [1]: https://aws.amazon.com/blogs/compute/node-js-8-10-runtime-now-available-in-aws-lambda/
export default async (event): Promise<any> => {
	try {
		await cards.initializeCardsDb();
		cardsData.inititialize();
		const simulator = new Simulator(cards, cardsData);

		const simulationResult = {
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

		const battleInput: BgsBattleInfo = JSON.parse(event.body);
		const playerInfo = battleInput.playerBoard;
		const opponentInfo = battleInput.opponentBoard;

		const playerBoard = cleanEnchantments(playerInfo.board);
		const opponentBoard = cleanEnchantments(opponentInfo.board);

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
		console.time('simulation');
		for (let i = 0; i < 5000; i++) {
			const input = JSON.parse(inputReady);
			const battleResult = simulator.simulateSingleBattle(
				input.playerBoard.board,
				input.playerBoard.player,
				input.opponentBoard.board,
				input.opponentBoard.player,
			);
			if (battleResult.result === 'won') {
				simulationResult.won++;
				simulationResult.damageWon += battleResult.damageDealt;
				if (!battleResult.damageDealt || battleResult.damageDealt === NaN) {
					console.debug('no damage dealt', battleResult);
				}
			} else if (battleResult.result === 'lost') {
				simulationResult.lost++;
				simulationResult.damageLost += battleResult.damageDealt;
			} else if (battleResult.result === 'tied') {
				simulationResult.tied++;
			}
		}
		const toatlMatches = simulationResult.won + simulationResult.tied + simulationResult.lost;
		simulationResult.wonPercent = (100 * simulationResult.won) / toatlMatches;
		simulationResult.tiedPercent = (100 * simulationResult.tied) / toatlMatches;
		simulationResult.lostPercent = (100 * simulationResult.lost) / toatlMatches;
		simulationResult.averageDamageWon = simulationResult.won
			? simulationResult.damageWon / simulationResult.won
			: undefined;
		simulationResult.averageDamageLost = simulationResult.lost
			? simulationResult.damageLost / simulationResult.lost
			: undefined;
		console.timeEnd('simulation');
		console.debug('simulation result', simulationResult);

		const response = {
			statusCode: 200,
			isBase64Encoded: false,
			body: JSON.stringify(simulationResult),
		};
		// console.log('sending back success reponse');
		return response;
	} catch (e) {
		console.error('issue retrieving stats', e);
		const response = {
			statusCode: 500,
			isBase64Encoded: false,
			body: null,
		};
		console.log('sending back error reponse', response);
		return response;
	}
};

const cleanEnchantments = (board: readonly BoardEntity[]): readonly BoardEntity[] => {
	const entityIds = board.map(entity => entity.entityId);
	return board.map(entity => ({
		...entity,
		enchantments: cleanEnchantmentsForEntity(entity.enchantments, entityIds),
	}));
};

const validEnchantments = [
	CardIds.NonCollectible.Neutral.ReplicatingMenace_ReplicatingMenaceEnchantment,
	CardIds.NonCollectible.Neutral.ReplicatingMenace_ReplicatingMenaceEnchantmentTavernBrawl,
];

const cleanEnchantmentsForEntity = (
	enchantments: { cardId: string; originEntityId: number }[],
	entityIds: readonly number[],
): { cardId: string; originEntityId: number }[] => {
	return enchantments.filter(
		enchant => entityIds.indexOf(enchant.originEntityId) !== -1 || validEnchantments.indexOf(enchant.cardId) !== -1,
	);
};
