import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { AvengeCard } from '../../card.interface';

export const TimewarpedPrimscale: AvengeCard = {
	cardIds: [TempCardIds.TimewarpedPrimscale, TempCardIds.TimewarpedPrimscale_G],
	baseAvengeValue: (cardId: string) => 3,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedPrimscale_G ? 2 : 1;
		const cardsToAdd = Array(mult).map(() =>
			input.gameState.cardsData.getRandomTavernSpell({ maxTavernTier: input.hero.tavernTier }),
		);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
