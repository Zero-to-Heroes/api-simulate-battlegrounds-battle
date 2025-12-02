import { Race } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addStatsToBoard } from '../../../utils';
import { AfterTavernSpellCastCard, CastSpellInput } from '../../card.interface';

export const TimewarpedLabRat: AfterTavernSpellCastCard = {
	cardIds: [CardIds.TimewarpedLabRat_BG34_PreMadeChamp_002, CardIds.TimewarpedLabRat_BG34_PreMadeChamp_002_G],
	afterTavernSpellCast: (entity: BoardEntity | BoardTrinket, input: CastSpellInput) => {
		const mult = entity.cardId === CardIds.TimewarpedLabRat_BG34_PreMadeChamp_002_G ? 2 : 1;
		addStatsToBoard(entity, input.board, input.hero, 2 * mult, 2 * mult, input.gameState, Race[Race.BEAST]);
	},
};
