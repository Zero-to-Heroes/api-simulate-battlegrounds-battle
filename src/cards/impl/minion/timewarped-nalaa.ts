import { BoardEntity } from '../../../board-entity';
import { TempCardIds } from '../../../temp-card-ids';
import { grantStatsToMinionsOfEachType } from '../../../utils';
import { CastSpellInput, OnTavernSpellCastCard } from '../../card.interface';

export const TimewarpedNalaa: OnTavernSpellCastCard = {
	cardIds: [TempCardIds.TimewarpedNalaa, TempCardIds.TimewarpedNalaa_G],
	onTavernSpellCast: (entity: BoardEntity, input: CastSpellInput) => {
		const mult = entity.cardId === TempCardIds.TimewarpedNalaa_G ? 2 : 1;
		grantStatsToMinionsOfEachType(entity, input.board, input.hero, 4 * mult, 4 * mult, input.gameState);
	},
};
