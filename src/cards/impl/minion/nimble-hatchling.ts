import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { BattlecryCard } from '../../card.interface';

export const NimbleHatchling: BattlecryCard = {
	cardIds: [TempCardIds.NimbleHatchling, TempCardIds.NimbleHatchling_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === TempCardIds.NimbleHatchling_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(TempCardIds.NimbleWingbat);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
		return true;
	},
};
