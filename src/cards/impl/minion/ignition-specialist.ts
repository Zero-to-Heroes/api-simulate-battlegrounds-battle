import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const IgnitionSpecialist: EndOfTurnCard = {
	cardIds: [CardIds.IgnitionSpecialist_BG28_595, CardIds.IgnitionSpecialist_BG28_595_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.IgnitionSpecialist_BG28_595_G ? 2 : 1;
		const cardsToAdd = [];
		for (let i = 0; i < 2 * mult; i++) {
			cardsToAdd.push(input.gameState.cardsData.getRandomTavernSpell());
		}
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
