import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { AvengeInput } from '../../../simulation/avenge';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { AvengeCard } from '../../card.interface';

export const TimewarpedPrimscale: AvengeCard = {
	cardIds: [CardIds.TimewarpedPrismscale_BG34_PreMadeChamp_022, CardIds.TimewarpedPrismscale_BG34_PreMadeChamp_022_G],
	baseAvengeValue: (cardId: string) => 3,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const mult = minion.cardId === CardIds.TimewarpedPrismscale_BG34_PreMadeChamp_022_G ? 2 : 1;
		const cardsToAdd = Array(mult).map(() =>
			input.gameState.cardsData.getRandomTavernSpell({ maxTavernTier: input.hero.tavernTier }),
		);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
