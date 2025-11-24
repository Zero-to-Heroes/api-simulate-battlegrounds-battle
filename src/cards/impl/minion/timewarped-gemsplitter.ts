import { BoardEntity } from '../../../board-entity';
import { OnDivineShieldUpdatedInput } from '../../../keywords/divine-shield';
import { TempCardIds } from '../../../temp-card-ids';
import { OnDivineShieldUpdatedCard } from '../../card.interface';

export const TimewarpedGemsplitter: OnDivineShieldUpdatedCard = {
	cardIds: [TempCardIds.TimewarpedGemsplitter, TempCardIds.TimewarpedGemsplitter_G],
	onDivineShieldUpdated: (minion: BoardEntity, input: OnDivineShieldUpdatedInput) => {
		if (input.newValue === false && input.previousValue === true) {
			const mult = minion.cardId === TempCardIds.TimewarpedGemsplitter_G ? 2 : 1;
			input.hero.globalInfo.BloodGemAttackBonus += 1 * mult;
		}
	},
};
