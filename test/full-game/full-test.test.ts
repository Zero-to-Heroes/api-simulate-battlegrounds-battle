import runSimulation from '../../src/retrieve-overview-match-stats';
import jsonEvent1 from './game1.json';
import jsonEvent2 from './game2.json';
import jsonEvent3 from './game3.json';

test('full test 1', async () => {
	const start = Date.now();
	const result = await runSimulation({ 'body': JSON.stringify(jsonEvent1) });
	// Need to return in less than 1s
	expect(Date.now() - start).toBeLessThan(1000 * 1000);
	console.debug('result', result);
	const simulationResult = JSON.parse(result.body);
	expect(simulationResult.wonPercent).toBe(100);
	expect(simulationResult.lost).toBe(0);
	expect(simulationResult.tied).toBe(0);
	validateInterval(simulationResult.averageDamageWon, 11.85);
});

test('full test 2', async () => {
	const start = Date.now();
	const result = await runSimulation({ 'body': JSON.stringify(jsonEvent2) });
	// Need to return in less than 1s
	expect(Date.now() - start).toBeLessThan(1000 * 1000);
	console.debug('result2', result);
	const simulationResult = JSON.parse(result.body);
	validateInterval(simulationResult.wonPercent, 31.5);
	validateInterval(simulationResult.lostPercent, 59.5);
	validateInterval(simulationResult.tiedPercent, 9);
	validateInterval(simulationResult.averageDamageWon, 11.8);
	validateInterval(simulationResult.averageDamageLost, 15.2);
});

test('full test 3', async () => {
	const start = Date.now();
	const result = await runSimulation({ 'body': JSON.stringify(jsonEvent3) });
	// Need to return in less than 1s
	expect(Date.now() - start).toBeLessThan(1000 * 1000);
	console.debug('result3', result);
	const simulationResult = JSON.parse(result.body);
	validateInterval(simulationResult.wonPercent, 7.8);
	validateInterval(simulationResult.lostPercent, 91);
	validateInterval(simulationResult.tiedPercent, 1.2);
	validateInterval(simulationResult.averageDamageWon, 9);
	validateInterval(simulationResult.averageDamageLost, 12.5);
});

const validateInterval = (value: number, target: number, band: number = 1) => {
	// Showing 8.5% instead of 8% is considered as acceptable as showing 60.5% instead of 60%
	// and easier to calibrate in tests
	expect(value).toBeGreaterThan(target - band);
	expect(value).toBeLessThan(target + band);
};
