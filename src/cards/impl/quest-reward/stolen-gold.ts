import { BoardTrinket } from '../../../bgs-player-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { makeMinionGolden } from '../../../simulation/utils/golden';

export const StolenGold = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		if (input.playerBoard.length > 0) {
			makeMinionGolden(
				input.playerBoard[0],
				input.playerEntity,
				input.playerBoard,
				input.playerEntity,
				input.opponentEntity,
				input.gameState,
			);
			if (input.playerBoard.length > 1) {
				makeMinionGolden(
					input.playerBoard[input.playerBoard.length - 1],
					input.playerEntity,
					input.playerBoard,
					input.playerEntity,
					input.opponentEntity,
					input.gameState,
				);
			}
			return true;
		}
	},
};
