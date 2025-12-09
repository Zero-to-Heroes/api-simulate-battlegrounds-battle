import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { AvengeInput } from '../../../simulation/avenge';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { AvengeCard } from '../../card.interface';

export const TimewarpedMothership: AvengeCard = {
	cardIds: [CardIds.TimewarpedMothership_BG34_Giant_598, CardIds.TimewarpedMothership_BG34_Giant_598_G],
	baseAvengeValue: (cardId: string) => 5,
	avenge: (minion: BoardEntity, input: AvengeInput): void => {
		const cards = minion.cardId === CardIds.TimewarpedMothership_BG34_Giant_598_G ? 2 : 1;
		const cardsAdded = Array.from({ length: cards }).map(() =>
			input.gameState.cardsData.getRandomProtossMinion(input.hero.tavernTier),
		);
		addCardsInHand(input.hero, input.board, cardsAdded, input.gameState);
	},
};
