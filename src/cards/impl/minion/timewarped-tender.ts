import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const TimewarpedTender: EndOfTurnCard = {
	cardIds: [CardIds.TimewarpedTender_BG34_Giant_603, CardIds.TimewarpedTender_BG34_Giant_603_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.TimewarpedTender_BG34_Giant_603_G ? 2 : 1;
		const cardsToAdd = Array(2 * mult).fill(() => input.gameState.cardsData.getRandomTavernSpell());
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
