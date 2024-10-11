import { BoardSecret } from '../../../board-secret';
import { pickRandom } from '../../../services/utils';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';

export const UpperHand = {
	startOfCombat: (trinket: BoardSecret, input: SoCInput) => {
		if (!!input.opponentBoard.length) {
			const target = pickRandom(input.opponentBoard);
			target.health = 1;
			target.maxHealth = 1;
			input.gameState.spectator.registerPowerTarget(input.playerEntity, target, input.opponentBoard, null, null);
			return true;
		}
	},
};
