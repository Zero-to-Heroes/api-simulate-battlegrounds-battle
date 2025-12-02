import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { grantStatsToMinionsOfEachType } from '../../../utils';
import { CastSpellInput, OnTavernSpellCastCard } from '../../card.interface';

export const TimewarpedNalaa: OnTavernSpellCastCard = {
	cardIds: [CardIds.TimewarpedNalaa_BG34_Giant_205, CardIds.TimewarpedNalaa_BG34_Giant_205_G],
	onTavernSpellCast: (entity: BoardEntity, input: CastSpellInput) => {
		const mult = entity.cardId === CardIds.TimewarpedNalaa_BG34_Giant_205_G ? 2 : 1;
		grantStatsToMinionsOfEachType(entity, input.board, input.hero, 4 * mult, 4 * mult, input.gameState);
	},
};
