import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const TimewarpedSubstrate: EndOfTurnCard = {
	cardIds: [CardIds.TimewarpedSubstrate_BG34_PreMadeChamp_032, CardIds.TimewarpedSubstrate_BG34_PreMadeChamp_032_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.TimewarpedSubstrate_BG34_PreMadeChamp_032_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.TemperatureShift_BG31_819);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
