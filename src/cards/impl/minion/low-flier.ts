import { BoardEntity } from '../../../board-entity';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const LowFlier: EndOfTurnCard = {
	cardIds: [TempCardIds.LowFlier, TempCardIds.LowFlier_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === TempCardIds.LowFlier_G ? 2 : 1;
		const targets = input.board.filter((e) => e.attack < minion.attack);
		for (const target of targets) {
			modifyStats(target, 1 * mult, 0, input.board, input.hero, input.gameState);
		}
	},
};
