/* eslint-disable @typescript-eslint/no-use-before-define */
import { BgsBattleInfo } from '../../src/bgs-battle-info';
import runSimulation from '../../src/simulate-bgs-battle';
import { SharedState } from '../../src/simulation/shared-state';
import jsonEvent1 from './game1.json';
import jsonEvent2 from './game2.json';
import jsonEvent3 from './game3.json';

describe.skip('Full tests for performance and accuracy', () => {
	test('full test 1', async () => {
		const result = await runSimulation({ 'body': JSON.stringify(jsonEvent1) });
		// Need to return in less than 1s
		console.debug('result', result);
		const simulationResult = JSON.parse(result.body);
		expect(simulationResult.wonPercent).toBe(100);
		expect(simulationResult.lost).toBe(0);
		expect(simulationResult.tied).toBe(0);
		validateInterval(simulationResult.averageDamageWon, 11.85);
	});

	test('full test 2', async () => {
		const result = await runSimulation({ 'body': JSON.stringify(jsonEvent2) });
		// Need to return in less than 1s
		console.debug('result2', result);
		const simulationResult = JSON.parse(result.body);
		validateInterval(simulationResult.wonPercent, 31.5);
		validateInterval(simulationResult.lostPercent, 59.5);
		validateInterval(simulationResult.tiedPercent, 9);
		validateInterval(simulationResult.averageDamageWon, 11.8);
		validateInterval(simulationResult.averageDamageLost, 15.2);
	});

	test.only('full test 3', async () => {
		const input: BgsBattleInfo = {
			...jsonEvent3,
			options: {
				numberOfSimulations: 1,
			},
		};
		SharedState.debugEnabled = false;
		const result = await runSimulation({ 'body': JSON.stringify(input) });
		const simulationResult = JSON.parse(result.body);

		// const sample = simulationResult.outcomeSamples.lost[0];
		// const base64 = encode(JSON.stringify(sample));
		// console.log('encoded', base64);
	});
});

const validateInterval = (value: number, target: number, band = 1) => {
	// Showing 8.5% instead of 8% is considered as acceptable as showing 60.5% instead of 60%
	// and easier to calibrate in tests
	expect(value).toBeGreaterThan(target - band);
	expect(value).toBeLessThan(target + band);
};
