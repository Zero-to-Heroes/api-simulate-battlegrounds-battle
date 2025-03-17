import { GameSample } from './simulation/spectator/game-sample';

export interface SimulationResult {
	wonLethal: number;
	won: number;
	tied: number;
	lost: number;
	lostLethal: number;
	damageWon: number;
	damageWons: number[];
	damageWonRange: {
		min: number;
		max: number;
	};
	damageLost: number;
	damageLosts: number[];
	damageLostRange: {
		min: number;
		max: number;
	};
	wonLethalPercent: number;
	wonPercent: number;
	tiedPercent: number;
	lostPercent: number;
	lostLethalPercent: number;
	averageDamageWon: number;
	averageDamageLost: number;
	outcomeSamples?: OutcomeSamples;
}

export interface OutcomeSamples {
	won: readonly GameSample[];
	lost: readonly GameSample[];
	tied: readonly GameSample[];
}
