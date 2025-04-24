import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { modifyStats } from '../../../simulation/stats';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const EchoingRoar: EndOfTurnCard = {
	cardIds: [CardIds.EchoingRoar_EchoingRoarEnchantment_BG28_814e],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const enchant = minion.enchantments?.find(
			(e) => e.cardId === CardIds.EchoingRoar_EchoingRoarEnchantment_BG28_814e,
		);
		const stats = enchant?.tagScriptDataNum1 ?? 1;
		modifyStats(minion, minion, 2 * stats, 2 * stats, input.board, input.hero, input.gameState);
	},
};
