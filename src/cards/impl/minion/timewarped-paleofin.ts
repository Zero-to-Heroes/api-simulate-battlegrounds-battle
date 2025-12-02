import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const TimewarpedPaleofin: EndOfTurnCard = {
	cardIds: [CardIds.TimewarpedPaleofin_BG34_PreMadeChamp_047, CardIds.TimewarpedPaleofin_BG34_PreMadeChamp_047_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.TimewarpedPaleofin_BG34_PreMadeChamp_047_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.CloningConch_BG28_601);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
