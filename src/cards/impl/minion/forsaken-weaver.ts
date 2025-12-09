import { BoardTrinket } from '../../../bgs-player-entity';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { AfterTavernSpellCastCard, CastSpellInput } from '../../card.interface';

export const ForsakenWeaver: AfterTavernSpellCastCard = {
	cardIds: [CardIds.ForsakenWeaver_BG34_692, CardIds.ForsakenWeaver_BG34_692_G],
	afterTavernSpellCast: (entity: BoardEntity | BoardTrinket, input: CastSpellInput) => {
		const mult = entity.cardId === CardIds.ForsakenWeaver_BG34_692_G ? 2 : 1;
		input.hero.globalInfo.UndeadAttackBonus += 2 * mult;
	},
};
