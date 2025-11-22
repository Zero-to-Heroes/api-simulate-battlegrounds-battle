import { BoardEntity } from '../../../board-entity';
import { TempCardIds } from '../../../temp-card-ids';
import { DefaultChargesCard, OnDamagedCard, OnDamagedInput } from '../../card.interface';

export const TimewarpedPiper: OnDamagedCard & DefaultChargesCard = {
	cardIds: [TempCardIds.TimewarpedPiper, TempCardIds.TimewarpedPiper_G],
	defaultCharges: (entity: BoardEntity) => 3,
	onDamaged: (minion: BoardEntity, input: OnDamagedInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedPiper_G ? 2 : 1;
		if (minion.abiityChargesLeft > 0) {
			input.hero.globalInfo.BloodGemAttackBonus += 1 * mult;
			minion.abiityChargesLeft--;
		}
		return true;
	},
};
