import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const BoarGamer: EndOfTurnCard = {
	cardIds: [CardIds.BoarGamer_BG31_329, CardIds.BoarGamer_BG31_329_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const cards = minion.cardId === CardIds.BoarGamer_BG31_329_G ? [null, null] : [null];
		addCardsInHand(input.hero, input.board, cards, input.gameState);
	},
};
