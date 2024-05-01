/* eslint-disable @typescript-eslint/no-use-before-define */
import { AllCardsService } from '@firestone-hs/reference-data';
import { BgsBattleInfo } from '../../src/bgs-battle-info';
import { encode } from '../../src/services/utils';
import runSimulation from '../../src/simulate-bgs-battle';
import { SharedState } from '../../src/simulation/shared-state';
import jsonEvent3 from './game.json';

console.log('starting test');
const test = async () => {
	console.log('preparing to run simulation');
	const start = Date.now();
	const input: BgsBattleInfo = {
		...jsonEvent3,
		options: {
			numberOfSimulations: 10000,
			skipInfoLogs: false,
			maxAcceptableDuration: 200000,
		},
		gameState: {
			currentTurn: 0,
		},
	} as any;
	SharedState.debugEnabled = false;
	const allCards = new AllCardsService();

	await allCards.initializeCardsDb(`${new Date().getTime()}`, 'test/full-game/cards_enUS.json', true);
	console.log('cards initialized', allCards.getCards().length);
	const result = await runSimulation({ body: JSON.stringify(input) }, allCards);
	const simulationResult = JSON.parse(result.body);
	console.log('result', {
		...simulationResult,
		outcomeSamples: undefined,
	});
	console.log('simulation took', Date.now() - start, 'ms');

	const sample =
		simulationResult.outcomeSamples.tied?.[0] ??
		simulationResult.outcomeSamples.lost?.[0] ??
		simulationResult.outcomeSamples.won?.[0] ??
		null;
	const base64 = encode(JSON.stringify(sample));
	console.log(base64);
	console.log('result', {
		...simulationResult,
		outcomeSamples: undefined,
	});
};
test();
