/* eslint-disable @typescript-eslint/no-use-before-define */
import { BgsBattleInfo } from '../../src/bgs-battle-info';
import runSimulation from '../../src/simulate-bgs-battle';
import { SharedState } from '../../src/simulation/shared-state';
import { encode } from '../../src/utils';
import jsonEvent3 from './game.json';

describe('Full tests for performance and accuracy', () => {
	test.only('full test 3', async () => {
		const input: BgsBattleInfo = {
			...jsonEvent3,
			options: {
				numberOfSimulations: 10000,
				skipInfoLogs: false,
			},
			gameState: {
				currentTurn: 0,
			},
		};
		SharedState.debugEnabled = false;
		const result = await runSimulation({ 'body': JSON.stringify(input) });
		const simulationResult = JSON.parse(result.body);
		console.log('result', {
			...simulationResult,
			outcomeSamples: undefined,
		});

		const sample = simulationResult.outcomeSamples.won[0];
		const base64 = encode(JSON.stringify(sample));
		console.log('encoded', base64);
	});
});

const validateInterval = (value: number, target: number, band = 1) => {
	// Showing 8.5% instead of 8% is considered as acceptable as showing 60.5% instead of 60%
	// and easier to calibrate in tests
	expect(value).toBeGreaterThan(target - band);
	expect(value).toBeLessThan(target + band);
};
