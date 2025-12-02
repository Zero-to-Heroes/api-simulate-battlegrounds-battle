import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { BattlecryCard } from '../../card.interface';

export const TrenchFighter: BattlecryCard = {
	cardIds: [CardIds.TrenchFighter_BG34_684, CardIds.TrenchFighter_BG34_684_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === CardIds.TrenchFighter_BG34_684_G ? 2 : 4;
		const cardsToAdd = Array(mult).fill(CardIds.GemConfiscation_BG28_698);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
		return true;
	},
};
