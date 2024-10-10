import { BoardTrinket } from '../../../bgs-player-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';

export const AllWillBurn = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		for (const entity of input.playerBoard) {
			modifyStats(entity, 2, 0, input.playerBoard, input.playerEntity, input.gameState);
			input.gameState.spectator.registerPowerTarget(input.playerEntity, entity, input.playerBoard, null, null);
		}
		for (const entity of input.opponentBoard) {
			modifyStats(entity, 2, 0, input.opponentBoard, input.opponentEntity, input.gameState);
			input.gameState.spectator.registerPowerTarget(input.playerEntity, entity, input.opponentBoard, null, null);
		}
		return true;
	},
};
