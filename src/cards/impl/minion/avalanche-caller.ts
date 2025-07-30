import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const AvalancheCaller: EndOfTurnCard = {
	cardIds: [TempCardIds.AvalancheCaller, TempCardIds.AvalancheCaller_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput): boolean => {
		const mult = minion.cardId === TempCardIds.AvalancheCaller_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(TempCardIds.MountingAvalanche);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
		return true;
	},
};
