import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { BattlecryCard } from '../../card.interface';

export const BriarbackDrummer: BattlecryCard = {
	cardIds: [CardIds.BriarbackDrummer_BG34_683, CardIds.BriarbackDrummer_BG34_683_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === CardIds.BriarbackDrummer_BG34_683_G ? 2 : 4;
		const cardsToAdd = Array(mult).fill(CardIds.BloodGemBarrage_BG34_689);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
		return true;
	},
};
