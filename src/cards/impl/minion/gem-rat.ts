import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const GemRat: EndOfTurnCard = {
	cardIds: [CardIds.GemRat_BG31_326, CardIds.GemRat_BG31_326_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const cards =
			minion.cardId === CardIds.GemRat_BG31_326_G
				? [CardIds.GemDay_BG31_893, CardIds.GemDay_BG31_893]
				: [CardIds.GemDay_BG31_893];
		addCardsInHand(input.hero, input.board, cards, input.gameState);
	},
};
