import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const MarqueeTicker: EndOfTurnCard = {
	cardIds: [CardIds.MarqueeTicker_BG31_178, CardIds.MarqueeTicker_BG31_178_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const cards = minion.cardId === CardIds.MarqueeTicker_BG31_178_G ? [null, null] : [null];
		addCardsInHand(input.hero, input.board, cards, input.gameState);
	},
};
