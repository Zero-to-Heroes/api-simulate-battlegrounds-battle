import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { AvengeCard } from '../../card.interface';

export const TimewrappedMothership: AvengeCard = {
	cardIds: [TempCardIds.TimewrappedMothership, TempCardIds.TimewrappedMothership_G],
	baseAvengeValue: (cardId: string) => 5,
	avenge: (minion: BoardEntity, input: AvengeInput): void => {
		const cards = minion.cardId === TempCardIds.TimewrappedMothership_G ? 2 : 1;
		const cardsAdded = Array(cards).map(() =>
			input.gameState.cardsData.getRandomProtossMinion(input.hero.tavernTier),
		);
		addCardsInHand(input.hero, input.board, cardsAdded, input.gameState);
	},
};
