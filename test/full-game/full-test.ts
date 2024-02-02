/* eslint-disable @typescript-eslint/no-use-before-define */
import { BgsBattleInfo } from '../../src/bgs-battle-info';
import { encode } from '../../src/services/utils';
import runSimulation from '../../src/simulate-bgs-battle';
import { SharedState } from '../../src/simulation/shared-state';
import jsonEvent3 from './game.json';

console.log('starting test');
const test = async () => {
	console.log('preparing to run simulation');
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
	const result = await runSimulation({ body: JSON.stringify(input) });
	const simulationResult = JSON.parse(result.body);
	console.log('result', {
		...simulationResult,
		outcomeSamples: undefined,
	});

	const sample = simulationResult.outcomeSamples.won[0];
	const base64 = encode(JSON.stringify(sample));
	console.log(base64);
	console.log('original sample length', JSON.stringify(sample).length);
	console.log('result', {
		...simulationResult,
		outcomeSamples: undefined,
	});
};
test();
