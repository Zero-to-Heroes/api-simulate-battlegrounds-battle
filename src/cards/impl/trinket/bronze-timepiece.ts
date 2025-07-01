import { BoardTrinket } from '../../../bgs-player-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';

export const BronzeTimepiece = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		if (input.playerBoard.length > 0) {
			input.playerBoard.forEach((entity) => {
				modifyStats(
					entity,
					trinket,
					0,
					Math.ceil(entity.attack / 2),
					input.playerBoard,
					input.playerEntity,
					input.gameState,
				);
			});
			return true;
		}
	},
};
