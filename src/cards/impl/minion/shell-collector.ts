import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { BattlecryCard } from '../../card.interface';

export const ShellCollector: BattlecryCard = {
	cardIds: [CardIds.ShellCollector_BG23_002, CardIds.ShellCollector_BG23_002_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const shellCollectorCardsToAdd =
			minion.cardId === CardIds.ShellCollector_BG23_002
				? [CardIds.TheCoinCore]
				: [CardIds.TheCoinCore, CardIds.TheCoinCore];
		addCardsInHand(input.hero, input.board, shellCollectorCardsToAdd, input.gameState);
		return true;
	},
};
