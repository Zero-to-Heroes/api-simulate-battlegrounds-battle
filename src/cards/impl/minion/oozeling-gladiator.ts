import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { BattlecryCard } from '../../card.interface';

export const OozelingGladiator: BattlecryCard = {
	cardIds: [CardIds.OozelingGladiator_BG27_002, CardIds.OozelingGladiator_BG27_002_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const oozelingCardsToAdd =
			minion.cardId === CardIds.OozelingGladiator_BG27_002
				? [CardIds.TheCoinCore, CardIds.TheCoinCore]
				: [CardIds.TheCoinCore, CardIds.TheCoinCore, CardIds.TheCoinCore, CardIds.TheCoinCore];
		addCardsInHand(input.hero, input.board, oozelingCardsToAdd, input.gameState);
		return true;
	},
};
