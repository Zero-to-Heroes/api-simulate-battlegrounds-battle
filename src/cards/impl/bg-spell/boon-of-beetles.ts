import { BoardSecret } from '../../../board-secret';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';

export const BoonOfBeetles = {
	startOfCombat: (secret: BoardSecret, input: SoCInput) => {
		// Add the scriptDataNum1 only on the start of combat phase, so that it doesn't trigger too soon
		secret.scriptDataNum1 = 2;
		return true;
	},
};
