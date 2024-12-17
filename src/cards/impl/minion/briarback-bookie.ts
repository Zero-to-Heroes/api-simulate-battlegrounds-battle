import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const BriarbackBookie: EndOfTurnCard = {
	cardIds: [CardIds.BriarbackBookie_BG27_028, CardIds.BriarbackBookie_BG27_028_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.BriarbackBookie_BG27_028 ? 1 : 2;
		const cards = Array(1 * mult).fill(CardIds.BloodGem);
		addCardsInHand(input.hero, input.board, cards, input.gameState);
	},
};
