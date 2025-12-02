import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { DefaultChargesCard, OnDamagedCard, OnDamagedInput } from '../../card.interface';

export const TimewarpedPiper: OnDamagedCard & DefaultChargesCard = {
	cardIds: [CardIds.TimewarpedPiper_BG34_Giant_069, CardIds.TimewarpedPiper_BG34_Giant_069_G],
	defaultCharges: (entity: BoardEntity) => 3,
	onDamaged: (minion: BoardEntity, input: OnDamagedInput) => {
		const mult = minion.cardId === CardIds.TimewarpedPiper_BG34_Giant_069_G ? 2 : 1;
		if (minion.abiityChargesLeft > 0) {
			input.hero.globalInfo.BloodGemAttackBonus += 1 * mult;
			minion.abiityChargesLeft--;
		}
		return true;
	},
};
