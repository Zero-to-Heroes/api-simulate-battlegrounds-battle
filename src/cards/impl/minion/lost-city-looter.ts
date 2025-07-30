import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const LostCityLooter: EndOfTurnCard = {
	cardIds: [TempCardIds.LostCityLooter, TempCardIds.LostCityLooter_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === TempCardIds.LostCityLooter_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(null);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
