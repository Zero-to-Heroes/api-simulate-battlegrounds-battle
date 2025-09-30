import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { modifyStats } from '../../../simulation/stats';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const StormpikeLieutenant: EndOfTurnCard = {
	cardIds: [CardIds.StormpikeLieutenant_BG22_HERO_003_Buddy, CardIds.StormpikeLieutenant_BG22_HERO_003_Buddy_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.StormpikeLieutenant_BG22_HERO_003_Buddy_G ? 2 : 1;
		const target = input.board[input.board.length - 1];
		modifyStats(target, minion, 0, 10 * mult, input.board, input.hero, input.gameState);
	},
};
