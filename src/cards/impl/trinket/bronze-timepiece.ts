import { BoardTrinket } from '../../../bgs-player-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { setEntityStats } from '../../../simulation/stats';

export const BronzeTimepiece = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		if (input.playerBoard.length > 0) {
			input.playerBoard.forEach((entity) => {
				const highest = Math.max(entity.attack, entity.health);
				setEntityStats(entity, highest, highest, input.playerBoard, input.playerEntity, input.gameState);
				input.gameState.spectator.registerPowerTarget(trinket, entity, input.playerBoard, null, null);
			});
			return true;
		}
	},
};
