import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const MarqueeTicker: EndOfTurnCard = {
	cardIds: [TempCardIds.MarqueeTicker, TempCardIds.MarqueeTicker_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const cards = minion.cardId === TempCardIds.MarqueeTicker_G ? [null, null] : [null];
		addCardsInHand(input.hero, input.board, cards, input.gameState);
	},
};