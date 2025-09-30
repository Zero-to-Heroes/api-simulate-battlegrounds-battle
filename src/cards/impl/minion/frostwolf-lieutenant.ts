import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { modifyStats } from '../../../simulation/stats';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const FrostwolfLieutenant: EndOfTurnCard = {
	cardIds: [CardIds.FrostwolfLieutenant_BG22_HERO_002_Buddy, CardIds.FrostwolfLieutenant_BG22_HERO_002_Buddy_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.FrostwolfLieutenant_BG22_HERO_002_Buddy_G ? 2 : 1;
		const target = input.board[0];
		modifyStats(target, minion, 10 * mult, 0, input.board, input.hero, input.gameState);
	},
};
