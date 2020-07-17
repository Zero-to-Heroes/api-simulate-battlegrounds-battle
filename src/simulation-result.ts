import { GameSample } from './simulation/spectator/game-sample';

export interface SimulationResult {
	won: number;
	tied: number;
	lost: number;
	damageWon: number;
	damageLost: number;
	wonPercent: number;
	tiedPercent: number;
	lostPercent: number;
	averageDamageWon: number;
	averageDamageLost: number;
	outcomeSamples?: {
		won: readonly GameSample[];
		lost: readonly GameSample[];
		tied: readonly GameSample[];
	};
}
