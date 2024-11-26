import { BoardTrinket } from '../../../bgs-player-entity';
import { updateDivineShield } from '../../../keywords/divine-shield';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';

export const HollyMallet = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		if (input.playerBoard.length > 0) {
			updateDivineShield(
				input.playerBoard[0],
				input.playerBoard,
				input.playerEntity,
				input.opponentEntity,
				true,
				input.gameState,
			);
			input.gameState.spectator.registerPowerTarget(
				input.playerEntity,
				input.playerBoard[0],
				input.playerBoard,
				null,
				null,
			);
			if (input.playerBoard.length > 1) {
				updateDivineShield(
					input.playerBoard[input.playerBoard.length - 1],
					input.playerBoard,
					input.playerEntity,
					input.opponentEntity,
					true,
					input.gameState,
				);
				input.gameState.spectator.registerPowerTarget(
					input.playerEntity,
					input.playerBoard[input.playerBoard.length - 1],
					input.playerBoard,
					null,
					null,
				);
			}
			return true;
		}
	},
};
