import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const TimewarpedSellemental: EndOfTurnCard = {
	cardIds: [TempCardIds.TimewarpedSellemental, TempCardIds.TimewarpedSellemental_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedSellemental_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.Sellemental_WaterDropletToken);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
