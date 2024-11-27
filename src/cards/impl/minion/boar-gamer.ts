import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const BoarGamer: EndOfTurnCard = {
	cardIds: [TempCardIds.BoarGamer, TempCardIds.BoarGamer_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const cards = minion.cardId === TempCardIds.GemRat_G ? [null, null] : [null];
		addCardsInHand(input.hero, input.board, cards, input.gameState);
	},
};
