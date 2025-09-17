import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const LostCityLooter: EndOfTurnCard = {
	cardIds: [CardIds.LostCityLooter_BG33_820, CardIds.LostCityLooter_BG33_820_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.LostCityLooter_BG33_820_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(null);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
