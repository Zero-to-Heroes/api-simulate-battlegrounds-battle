import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { AvengeInput } from '../../../simulation/avenge';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { AvengeCard } from '../../card.interface';

export const TimewarpedCopter: AvengeCard = {
	cardIds: [CardIds.TimewarpedCopter_BG34_Giant_302, CardIds.TimewarpedCopter_BG34_Giant_302_G],
	baseAvengeValue: (cardId: string) => 3,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const mult = minion.cardId === CardIds.TimewarpedCopter_BG34_Giant_302_G ? 2 : 1;
		const cardsToAdd = [];
		for (let i = 0; i < mult; i++) {
			const cardToAdd = input.gameState.cardsData.getRandomMinionForTribe(Race.MECH, input.hero.tavernTier ?? 3);
			if (cardToAdd) {
				cardsToAdd.push(cardToAdd);
			}
		}
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
