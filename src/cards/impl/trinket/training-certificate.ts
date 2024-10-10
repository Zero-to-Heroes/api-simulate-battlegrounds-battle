import { BoardTrinket } from '../../../bgs-player-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { setEntityStats } from '../../../simulation/stats';

export const TrainingCertificate = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		if (input.playerBoard.length > 0) {
			const minionsByAttack = [...input.playerBoard].sort((a, b) => a.attack - b.attack);
			const firstTarget = minionsByAttack[0];
			setEntityStats(
				firstTarget,
				2 * firstTarget.maxAttack,
				2 * firstTarget.maxHealth,
				input.playerBoard,
				input.playerEntity,
				input.gameState,
			);
			input.gameState.spectator.registerPowerTarget(trinket, firstTarget, input.playerBoard, null, null);
			if (input.playerBoard.length > 1) {
				const secondTarget = minionsByAttack[1];
				setEntityStats(
					secondTarget,
					2 * secondTarget.maxAttack,
					2 * secondTarget.maxHealth,
					input.playerBoard,
					input.playerEntity,
					input.gameState,
				);
				input.gameState.spectator.registerPowerTarget(trinket, secondTarget, input.playerBoard, null, null);
			}
			return true;
		}
	},
};
