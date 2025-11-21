import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { BattlecryCard } from '../../card.interface';

export const ShellCollector: BattlecryCard = {
	cardIds: [CardIds.ShellCollector_BG23_002, CardIds.ShellCollector_BG23_002_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const shellCollectorCardsToAdd =
			minion.cardId === CardIds.ShellCollector_BG23_002
				? [CardIds.TavernCoin_BG28_810]
				: [CardIds.TavernCoin_BG28_810, CardIds.TavernCoin_BG28_810];
		addCardsInHand(input.hero, input.board, shellCollectorCardsToAdd, input.gameState);
		return true;
	},
};
