import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const TimewarpedSellemental: EndOfTurnCard = {
	cardIds: [CardIds.TimewarpedSellemental_BG34_Giant_067, CardIds.TimewarpedSellemental_BG34_Giant_067_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.TimewarpedSellemental_BG34_Giant_067_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.Sellemental_WaterDropletToken);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
