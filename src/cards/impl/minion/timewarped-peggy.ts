import { BoardEntity } from '../../../board-entity';
import { OnCardAddedToHandInput } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { addStatsToBoard } from '../../../utils';
import { OnCardAddedToHandCard } from '../../card.interface';

export const TimewarpedPeggy: OnCardAddedToHandCard = {
	cardIds: [TempCardIds.TimewarpedPeggy, TempCardIds.TimewarpedPeggy_G],
	onCardAddedToHand: (minion: BoardEntity, input: OnCardAddedToHandInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedPeggy_G ? 2 : 1;
		addStatsToBoard(minion, input.board, input.hero, 1 * mult, 1 * mult, input.gameState);
	},
};
