import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnCardAddedToHandInput } from '../../../simulation/cards-in-hand';
import { addStatsToBoard } from '../../../utils';
import { OnCardAddedToHandCard } from '../../card.interface';

export const TimewarpedPeggy: OnCardAddedToHandCard = {
	cardIds: [CardIds.TimewarpedPeggy_BG34_Giant_327, CardIds.TimewarpedPeggy_BG34_Giant_327_G],
	onCardAddedToHand: (minion: BoardEntity, input: OnCardAddedToHandInput) => {
		const mult = minion.cardId === CardIds.TimewarpedPeggy_BG34_Giant_327_G ? 2 : 1;
		addStatsToBoard(minion, input.board, input.hero, 1 * mult, 1 * mult, input.gameState);
	},
};
