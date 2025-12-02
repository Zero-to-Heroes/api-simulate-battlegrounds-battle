import { BoardEntity } from '../../../board-entity';
import { OnDivineShieldUpdatedInput } from '../../../keywords/divine-shield';
import { CardIds } from '../../../services/card-ids';
import { OnDivineShieldUpdatedCard } from '../../card.interface';

export const TimewarpedGemsplitter: OnDivineShieldUpdatedCard = {
	cardIds: [CardIds.TimewarpedGemsplitter_BG34_Giant_644, CardIds.TimewarpedGemsplitter_BG34_Giant_644_G],
	onDivineShieldUpdated: (minion: BoardEntity, input: OnDivineShieldUpdatedInput) => {
		if (input.newValue === false && input.previousValue === true) {
			const mult = minion.cardId === CardIds.TimewarpedGemsplitter_BG34_Giant_644_G ? 2 : 1;
			input.hero.globalInfo.BloodGemAttackBonus += 1 * mult;
		}
	},
};
