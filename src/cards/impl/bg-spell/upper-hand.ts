import { BoardSecret } from '../../../board-secret';
import { pickRandom } from '../../../services/utils';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { setEntityStats } from '../../../simulation/stats';

export const UpperHand = {
	startOfCombat: (trinket: BoardSecret, input: SoCInput) => {
		if (!!input.opponentBoard.length) {
			const target = pickRandom(input.opponentBoard);
			setEntityStats(target, target.attack, 1, input.opponentBoard, input.opponentEntity, input.gameState);
			input.gameState.spectator.registerPowerTarget(input.playerEntity, target, input.opponentBoard, null, null);
			return true;
		}
	},
};
