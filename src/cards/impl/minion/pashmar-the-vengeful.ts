import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { AvengeInput } from '../../../simulation/avenge';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { AvengeCard } from '../../card.interface';

export const PashmarTheVengeful: AvengeCard = {
	cardIds: [CardIds.PashmarTheVengeful_BG23_014, CardIds.PashmarTheVengeful_BG23_014_G],
	baseAvengeValue: (cardId: string) => 3,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const mult = minion.cardId === CardIds.PashmarTheVengeful_BG23_014_G ? 2 : 1;
		const cardsToAdd = [];
		for (let i = 0; i < mult; i++) {
			cardsToAdd.push(input.gameState.cardsData.getRandomSpellcraft());
		}
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
