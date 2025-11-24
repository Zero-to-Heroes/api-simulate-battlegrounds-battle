import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const TimewarpedSubstrate: EndOfTurnCard = {
	cardIds: [TempCardIds.TimewarpedSubstrate, TempCardIds.TimewarpedSubstrate_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedSubstrate_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.TemperatureShift_BG31_819);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
