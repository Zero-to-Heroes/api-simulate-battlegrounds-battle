/* eslint-disable @typescript-eslint/no-use-before-define */

import { BgsBattleInfo } from '../../../src/bgs-battle-info';
import runSimulation from '../../../src/simulate-bgs-battle';
import { SimulationResult } from '../../../src/simulation-result';
import { SharedState } from '../../../src/simulation/shared-state';
import jsonEvents from './data.json';

describe('Test card data', () => {
	test('test 1', async () => {
		const input: BgsBattleInfo = {
			...jsonEvents,
			options: {
				numberOfSimulations: 1,
			},
		};
		SharedState.debugEnabled = true;
		const result = await runSimulation({ 'body': JSON.stringify(input) });
		const simulationResult: SimulationResult = JSON.parse(result.body);

		// const sample = simulationResult.outcomeSamples.lost[0];
		// const base64 = encode(JSON.stringify(sample));
		// console.log('encoded', base64);
	});
});
