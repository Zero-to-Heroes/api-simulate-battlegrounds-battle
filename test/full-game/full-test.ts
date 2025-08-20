/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsLocalService } from '@firestone-hs/reference-data';
import { readFileSync } from 'fs';
import { BgsBattleInfo } from '../../src/bgs-battle-info';
import { encode } from '../../src/services/utils';
import runSimulation, { assignCards } from '../../src/simulate-bgs-battle';
import { applyDebugState } from './apply-debug-state';
import jsonEvent3 from './game.json';

console.log('starting test');
const test = async () => {
	Error.stackTraceLimit = Infinity;
	process.env.FORCE_COLOR = '0';
	process.env.NO_COLOR = '1';
	console.log('preparing to run simulation');
	const start = Date.now();
	const input: BgsBattleInfo = {
		...jsonEvent3,
		options: {
			...jsonEvent3.options,
			numberOfSimulations: 5000,
			skipInfoLogs: false,
			maxAcceptableDuration: 5000,
			itermediateResults: 0,
			includeOutcomeSamples: true,
			damageConfidence: 0.95,
		},
		gameState: {
			...jsonEvent3.gameState,
			currentTurn: 0,
		},
	} as any;

	applyDebugState();

	const cardsStr = readFileSync('test/full-game/cards_enUS.json').toString();
	const allCards = new AllCardsLocalService(cardsStr);
	// const allCards = new AllCardsService();
	await allCards.initializeCardsDb();
	console.log('cards initialized', allCards.getCards().length);
	assignCards(allCards);

	const result = await runSimulation({ body: JSON.stringify(input) });
	const simulationResult = JSON.parse(result.body);
	console.log('result', {
		...simulationResult,
		// outcomeSamples: undefined,
	});
	console.log(JSON.stringify(simulationResult));
	console.log('simulation took', Date.now() - start, 'ms');

	const sample =
		simulationResult.outcomeSamples.tied?.[0] ??
		simulationResult.outcomeSamples.won?.[0] ??
		simulationResult.outcomeSamples.lost?.[0] ??
		null;
	const base64 = encode(JSON.stringify(sample));
	console.log(base64);
	console.log('result', {
		...simulationResult,
		outcomeSamples: undefined,
	});
};
test();
