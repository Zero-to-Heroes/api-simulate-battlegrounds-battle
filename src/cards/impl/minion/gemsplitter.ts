import { BoardEntity } from '../../../board-entity';
import { OnDivineShieldUpdatedInput } from '../../../keywords/divine-shield';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { OnDivineShieldUpdatedCard } from '../../card.interface';

export const Gemsplitter: OnDivineShieldUpdatedCard = {
	cardIds: [CardIds.Gemsplitter_BG21_037, CardIds.Gemsplitter_BG21_037_G],
	onDivineShieldUpdated: (minion: BoardEntity, input: OnDivineShieldUpdatedInput) => {
		if (input.newValue === false && input.previousValue === true) {
			const mult = minion.cardId === CardIds.Gemsplitter_BG21_037_G ? 2 : 1;
			const cardsToAdd = Array(mult).fill(CardIds.BloodGem);
			addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
		}
	},
};
