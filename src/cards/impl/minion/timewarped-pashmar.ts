import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { AvengeInput } from '../../../simulation/avenge';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { AvengeCard } from '../../card.interface';

export const TimewarpedPashmar: AvengeCard = {
	cardIds: [CardIds.TimewarpedPashmar_BG34_Giant_211, CardIds.TimewarpedPashmar_BG34_Giant_211_G],
	baseAvengeValue: (cardId: string) => 3,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const mult = minion.cardId === CardIds.TimewarpedPashmar_BG34_Giant_211_G ? 2 : 1;
		const cardsToAdd = [];
		for (let i = 0; i < mult; i++) {
			cardsToAdd.push(
				input.gameState.cardsData.getRandomSpellcraft({ maxTavernTier: input.hero.tavernTier ?? 3 }),
			);
		}
		for (let i = 0; i < mult; i++) {
			cardsToAdd.push(input.gameState.cardsData.getRandomTavernSpell());
		}
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
