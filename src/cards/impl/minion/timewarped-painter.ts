import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { getNeighbours } from '../../../simulation/attack';
import { modifyStats } from '../../../simulation/stats';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const TimewarpedPainter: EndOfTurnCard = {
	cardIds: [CardIds.TimewarpedPainter_BG34_Giant_319, CardIds.TimewarpedPainter_BG34_Giant_319_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const targets = getNeighbours(input.board, minion);
		const mult = minion.cardId === CardIds.TimewarpedPainter_BG34_Giant_319_G ? 2 : 1;
		const baseBuff = minion.scriptDataNum1 ?? 1;
		for (const target of targets) {
			input.gameState.spectator.registerPowerTarget(minion, target, input.board, input.hero, input.otherHero);
			modifyStats(
				target,
				minion,
				2 * baseBuff * mult,
				1 * baseBuff * mult,
				input.board,
				input.hero,
				input.gameState,
			);
		}
	},
};
