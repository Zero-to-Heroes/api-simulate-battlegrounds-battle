import { CardIds, CardType } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnCardAddedToHandInput } from '../../../simulation/cards-in-hand';
import { addStatsToBoard } from '../../../utils';
import { OnCardAddedToHandCard } from '../../card.interface';

export const FireworksFanatic: OnCardAddedToHandCard = {
	cardIds: [CardIds.FireworksFanatic_BG25_922, CardIds.FireworksFanatic_BG25_922_G],
	onCardAddedToHand: (entity: BoardEntity, input: OnCardAddedToHandInput) => {
		if (input.addedCard?.cardId == null) {
			return;
		}
		const refCard = input.gameState.allCards.getCard(input.addedCard.cardId);
		if (refCard?.type?.toUpperCase() !== CardType[CardType.MINION]) {
			return;
		}
		const doWeAlreadyHaveThisCard =
			input.board.some((e) => e.cardId === input.addedCard.cardId) ||
			input.hero.hand?.some((e) => e.cardId === input.addedCard.cardId);
		if (doWeAlreadyHaveThisCard) {
			const mult = entity.cardId === CardIds.FireworksFanatic_BG25_922_G ? 2 : 1;
			addStatsToBoard(entity, input.board, input.hero, 1 * mult, 1 * mult, input.gameState);
		}
	},
};
