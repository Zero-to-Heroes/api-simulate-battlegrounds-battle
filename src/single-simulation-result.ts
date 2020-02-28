export interface SingleSimulationResult {
	readonly result: 'won' | 'lost' | 'tied';
	readonly damageDealt: number;
}
