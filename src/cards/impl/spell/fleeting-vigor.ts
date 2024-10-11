import { BoardSecret } from '../../../board-secret';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { addStatsToBoard } from '../../../utils';

export const FleetingVigor = {
	startOfCombat: (secret: BoardSecret, input: SoCInput) => {
		addStatsToBoard(secret, input.playerBoard, input.playerEntity, 2, 1, input.gameState);
		return true;
	},
};
