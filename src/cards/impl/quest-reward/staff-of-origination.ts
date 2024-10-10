import { BoardTrinket } from '../../../bgs-player-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';

export const StaffOfOrigination = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		input.playerBoard.forEach((entity) => {
			modifyStats(entity, 15, 15, input.playerBoard, input.playerEntity, input.gameState);
			input.gameState.spectator.registerPowerTarget(input.playerEntity, entity, input.playerBoard, null, null);
		});
		return true;
	},
};
