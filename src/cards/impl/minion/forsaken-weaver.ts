import { BoardTrinket } from '../../../bgs-player-entity';
import { BoardEntity } from '../../../board-entity';
import { TempCardIds } from '../../../temp-card-ids';
import { AfterTavernSpellCastCard, CastSpellInput } from '../../card.interface';

export const ForsakenWeaver: AfterTavernSpellCastCard = {
	cardIds: [TempCardIds.ForsakenWeaver, TempCardIds.ForsakenWeaver_G],
	afterTavernSpellCast: (entity: BoardEntity | BoardTrinket, input: CastSpellInput) => {
		const mult = entity.cardId === TempCardIds.ForsakenWeaver_G ? 2 : 1;
		input.hero.globalInfo.UndeadAttackBonus += 1 * mult;
	},
};
