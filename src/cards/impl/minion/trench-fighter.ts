import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { BattlecryCard } from '../../card.interface';

export const TrenchFighter: BattlecryCard = {
	cardIds: [TempCardIds.TrenchFighter, TempCardIds.TrenchFighter_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === TempCardIds.TrenchFighter_G ? 2 : 4;
		const cardsToAdd = Array(mult).fill(CardIds.GemConfiscation_BG28_698);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
		return true;
	},
};
