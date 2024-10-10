import { BoardTrinket } from '../../../bgs-player-entity';
import { updateDivineShield } from '../../../divine-shield';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';

export const BlessedOrBlighted = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		if (input.playerBoard.length > 0) {
			const dsTarget = input.playerBoard[0];
			updateDivineShield(
				dsTarget,
				input.playerBoard,
				input.playerEntity,
				input.opponentEntity,
				true,
				input.gameState,
			);
			const rebornTarget = input.playerBoard[input.playerBoard.length - 1];
			rebornTarget.reborn = true;
			return true;
		}
	},
};
