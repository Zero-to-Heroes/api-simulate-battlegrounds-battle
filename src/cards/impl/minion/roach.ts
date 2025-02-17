import { BoardEntity } from '../../../board-entity';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const Roach: EndOfTurnCard = {
	cardIds: [TempCardIds.Roach, TempCardIds.Roach_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === TempCardIds.Roach_G ? 2 : 1;
		modifyStats(minion, 0, input.hero.tavernTier * mult, input.board, input.hero, input.gameState);
	},
};
