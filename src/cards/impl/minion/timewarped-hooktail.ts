import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addStatsToBoard } from '../../../utils';
import { CastSpellInput, OnTavernSpellCastCard } from '../../card.interface';

export const TimewarpedHootail: OnTavernSpellCastCard = {
	cardIds: [CardIds.TimewarpedHooktail_BG34_Giant_015, CardIds.TimewarpedHooktail_BG34_Giant_015_G],
	onTavernSpellCast: (entity: BoardEntity, input: CastSpellInput) => {
		const mult = entity.cardId === CardIds.TimewarpedHooktail_BG34_Giant_015_G ? 2 : 1;
		addStatsToBoard(entity, input.board, input.hero, 2 * mult, 1 * mult, input.gameState);
	},
};
