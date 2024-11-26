import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { grantDivineShieldToLeftmostMinions } from '../../../keywords/divine-shield';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';

export const SunScreener = {
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		if (input.playerBoard.length > 0 || input.opponentBoard.length > 0) {
			const quantity = minion.cardId === CardIds.SunScreener_BG30_101 ? 3 : 6;
			grantDivineShieldToLeftmostMinions(
				minion,
				input.playerBoard,
				input.playerEntity,
				quantity,
				input.opponentEntity,
				input.gameState,
			);
			grantDivineShieldToLeftmostMinions(
				minion,
				input.opponentBoard,
				input.opponentEntity,
				quantity,
				input.playerEntity,
				input.gameState,
			);
		}
		return true;
	},
};
