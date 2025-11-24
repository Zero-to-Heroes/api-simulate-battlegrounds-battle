import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const TimewarpedTender: EndOfTurnCard = {
	cardIds: [TempCardIds.TimewarpedTender, TempCardIds.TimewarpedTender_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedTender_G ? 2 : 1;
		const cardsToAdd = Array(2 * mult).fill(() => input.gameState.cardsData.getRandomTavernSpell());
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
