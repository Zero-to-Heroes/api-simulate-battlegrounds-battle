import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const AvalancheCaller: EndOfTurnCard = {
	cardIds: [CardIds.AvalancheCaller_BG33_337, CardIds.AvalancheCaller_BG33_337_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput): boolean => {
		const mult = minion.cardId === CardIds.AvalancheCaller_BG33_337_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.MountingAvalanche_BG33_899);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
		return true;
	},
};
