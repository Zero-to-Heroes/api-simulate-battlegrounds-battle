import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const TimewarpedPaleofin: EndOfTurnCard = {
	cardIds: [TempCardIds.TimewarpedPaleofin, TempCardIds.TimewarpedPaleofin_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedPaleofin_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.CloningConch_BG28_601);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
