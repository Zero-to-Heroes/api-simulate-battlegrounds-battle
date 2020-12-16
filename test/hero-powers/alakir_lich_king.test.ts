/* eslint-disable @typescript-eslint/no-use-before-define */
import { BgsBattleInfo } from '../../src/bgs-battle-info';
import runSimulation from '../../src/simulate-bgs-battle';
import { SimulationResult } from '../../src/simulation-result';
import { SharedState } from '../../src/simulation/shared-state';
import { encode } from '../../src/utils';
import jsonEvents from './alakir_lich_king.json';
import jsonEvents2 from './alakir_lich_king_2.json';

describe('Test when Alakir and Lich King face each other', () => {
	test('full test 1', async () => {
		const input: BgsBattleInfo = {
			...jsonEvents,
			options: {
				numberOfSimulations: 1,
			},
		};
		SharedState.debugEnabled = false;
		const result = await runSimulation({ 'body': JSON.stringify(input) });
		const simulationResult: SimulationResult = JSON.parse(result.body);

		const sample = simulationResult.outcomeSamples.won[0];
		const base64 = encode(JSON.stringify(sample));
		console.log('encoded', base64);

		expect(simulationResult.tiedPercent).toBe(100);
	});

	// This fails because of the "attack immediately" implementation of scallywag
	test.only('full test 2', async () => {
		const input: BgsBattleInfo = {
			...jsonEvents2,
			options: {
				numberOfSimulations: 1000,
			},
		};
		SharedState.debugEnabled = false;
		const result = await runSimulation({ 'body': JSON.stringify(input) });
		const simulationResult: SimulationResult = JSON.parse(result.body);

		// const sample = simulationResult.outcomeSamples.tied[0];
		// const base64 = encode(JSON.stringify(sample));
		// console.log('encoded', base64);

		expect(simulationResult.lostPercent).toBe(100);
	});
});
