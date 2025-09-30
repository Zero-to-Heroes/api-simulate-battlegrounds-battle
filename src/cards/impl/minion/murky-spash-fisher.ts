import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { BattlecryCard } from '../../card.interface';

export const MurkySpashFisher: BattlecryCard = {
	cardIds: [CardIds.MurkySplashFisher_BG33_897, CardIds.MurkySplashFisher_BG33_897_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === CardIds.MurkySplashFisher_BG33_897_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.MurkysFish_BG33_898);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
		return true;
	},
};
