import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { getMagnetizations } from '../../../simulation/magnetize';
import { modifyStats } from '../../../simulation/stats';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const UtilityDrone: EndOfTurnCard = {
	cardIds: [CardIds.UtilityDrone_BG26_152, CardIds.UtilityDrone_BG26_152_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.UtilityDrone_BG26_152_G ? 2 : 1;
		for (const target of input.board) {
			const magnetizations = getMagnetizations(target, input.gameState);
			if (magnetizations > 0) {
				modifyStats(
					target,
					minion,
					4 * magnetizations * mult,
					4 * magnetizations * mult,
					input.board,
					input.hero,
					input.gameState,
				);
			}
		}
	},
};
