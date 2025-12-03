import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { modifyStats } from '../../../simulation/stats';
import { CastSpellInput, OnTavernSpellCastCard } from '../../card.interface';

export const TheGladIator: OnTavernSpellCastCard = {
	cardIds: [CardIds.TheGladIator_BG27_025, CardIds.TheGladIator_BG27_025_G],
	onTavernSpellCast: (minion: BoardEntity, input: CastSpellInput) => {
		const mult = minion.cardId === CardIds.TheGladIator_BG27_025_G ? 2 : 1;
		modifyStats(minion, minion, 1 * mult, 0, input.board, input.hero, input.gameState);
	},
};
