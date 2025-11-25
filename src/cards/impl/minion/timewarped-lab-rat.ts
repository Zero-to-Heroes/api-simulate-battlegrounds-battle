import { Race } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { BoardEntity } from '../../../board-entity';
import { TempCardIds } from '../../../temp-card-ids';
import { addStatsToBoard } from '../../../utils';
import { AfterTavernSpellCastCard, CastSpellInput } from '../../card.interface';

export const TimewarpedLabRat: AfterTavernSpellCastCard = {
	cardIds: [TempCardIds.TimewarpedLabRat, TempCardIds.TimewarpedLabRat_G],
	afterTavernSpellCast: (entity: BoardEntity | BoardTrinket, input: CastSpellInput) => {
		const mult = entity.cardId === TempCardIds.TimewarpedLabRat_G ? 2 : 1;
		addStatsToBoard(entity, input.board, input.hero, 2 * mult, 2 * mult, input.gameState, Race[Race.BEAST]);
	},
};
