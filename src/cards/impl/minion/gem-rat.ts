import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const GemRat: EndOfTurnCard = {
	cardIds: [TempCardIds.GemRat, TempCardIds.GemRat_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const cards =
			minion.cardId === TempCardIds.GemRat_G ? [TempCardIds.GemDay, TempCardIds.GemDay] : [TempCardIds.GemDay];
		addCardsInHand(input.hero, input.board, cards, input.gameState);
	},
};
