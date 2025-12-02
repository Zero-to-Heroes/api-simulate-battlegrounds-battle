import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { modifyStats } from '../../../simulation/stats';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const TimewarpedLowFlier: EndOfTurnCard = {
	cardIds: [CardIds.TimewarpedLowFlier_BG34_Giant_065, CardIds.TimewarpedLowFlier_BG34_Giant_065_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.TimewarpedLowFlier_BG34_Giant_065_G ? 2 : 1;

		const attackTargets = input.board.filter((e) => e.attack < minion.attack);
		for (const target of attackTargets) {
			modifyStats(target, minion, 2 * mult, 0, input.board, input.hero, input.gameState);
		}

		const healthTargets = input.board.filter((e) => e.health < minion.health);
		for (const target of healthTargets) {
			modifyStats(target, minion, 0, 2 * mult, input.board, input.hero, input.gameState);
		}
	},
};
