import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { BattlecryCard } from '../../card.interface';

export const NimbleHatchling: BattlecryCard = {
	cardIds: [CardIds.NimbleHatchling_BG33_244, CardIds.NimbleHatchling_BG33_244_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === CardIds.NimbleHatchling_BG33_244_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.NimbleWingbeat_BG33_248);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
		return true;
	},
};
