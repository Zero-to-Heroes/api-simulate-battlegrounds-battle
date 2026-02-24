import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addStatsToBoard } from '../../../utils';
import { CastSpellInput, OnTavernSpellCastCard } from '../../card.interface';

export const SunderedMatriarch: OnTavernSpellCastCard = {
	cardIds: [CardIds.SunderedMatriarch_BG33_923, CardIds.SunderedMatriarch_BG33_923_G],
	onTavernSpellCast: (minion: BoardEntity, input: CastSpellInput) => {
		if (input.source === input.hero) {
			const mult = minion.cardId === CardIds.SunderedMatriarch_BG33_923_G ? 2 : 1;
			addStatsToBoard(minion, input.board, input.hero, 0, 3 * mult, input.gameState);
		}
	},
};
