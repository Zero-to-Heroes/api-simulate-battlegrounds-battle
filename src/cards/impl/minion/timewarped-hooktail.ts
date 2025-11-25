import { BoardEntity } from '../../../board-entity';
import { TempCardIds } from '../../../temp-card-ids';
import { addStatsToBoard } from '../../../utils';
import { CastSpellInput, OnTavernSpellCastCard } from '../../card.interface';

export const TimewarpedHootail: OnTavernSpellCastCard = {
	cardIds: [TempCardIds.TimewarpedHootail, TempCardIds.TimewarpedHootail_G],
	onTavernSpellCast: (entity: BoardEntity, input: CastSpellInput) => {
		const mult = entity.cardId === TempCardIds.TimewarpedHootail_G ? 2 : 1;
		addStatsToBoard(entity, input.board, input.hero, 2 * mult, 1 * mult, input.gameState);
	},
};
