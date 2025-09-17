import { CardIds } from '../../../services/card-ids';
import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { addStatsToBoard } from '../../../utils';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const SpringySpriggan: EndOfTurnCard = {
	cardIds: [
		CardIds.SpringySpriggan_BG32_171,
		CardIds.SpringySpriggan_BG32_171_G,
		CardIds.SpringySpriggan_SpringySprigganEnchantment_BG32_171e2,
		CardIds.SpringySpriggan_SpringySprigganEnchantment_BG32_171_Ge2,
	],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult =
			minion.cardId === CardIds.SpringySpriggan_BG32_171_G ||
			minion.cardId === CardIds.SpringySpriggan_SpringySprigganEnchantment_BG32_171_Ge2
				? 2
				: 1;
		addStatsToBoard(minion, input.board, input.hero, 1 * mult, 0, input.gameState, Race[Race.MECH]);
	},
};
