import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { TempCardIds } from '../../../temp-card-ids';
import { addStatsToBoard } from '../../../utils';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const SpringySpriggan: EndOfTurnCard = {
	cardIds: [
		TempCardIds.SpringySpriggan,
		TempCardIds.SpringySpriggan_G,
		TempCardIds.SpringySpriggan_Enchantment,
		TempCardIds.SpringySpriggan_Enchantment_G,
	],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult =
			minion.cardId === TempCardIds.SpringySpriggan_G ||
			minion.cardId === TempCardIds.SpringySpriggan_Enchantment_G
				? 2
				: 1;
		addStatsToBoard(minion, input.board, input.hero, 1 * mult, 0, input.gameState, Race[Race.MECH]);
	},
};
