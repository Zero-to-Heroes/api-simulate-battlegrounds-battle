import { BoardTrinket } from '../../../bgs-player-entity';
import { updateDivineShield } from '../../../keywords/divine-shield';
import { updateReborn } from '../../../keywords/reborn';
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
			updateReborn(
				rebornTarget,
				true,
				input.playerBoard,
				input.playerEntity,
				input.opponentEntity,
				input.gameState,
			);
			return true;
		}
	},
};
