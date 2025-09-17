import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { AvengeCard } from '../../card.interface';

export const DreamingThornweaver: AvengeCard = {
	cardIds: [CardIds.DreamingThornweaver_BG32_433, CardIds.DreamingThornweaver_BG32_433_G],
	baseAvengeValue: (cardId: string) => 4,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const mult = minion.cardId === CardIds.DreamingThornweaver_BG32_433_G ? 2 : 1;
		if (minion.scriptDataNum1 === 1) {
			input.hero.globalInfo.BloodGemAttackBonus += 1 * mult;
		} else {
			input.hero.globalInfo.BloodGemHealthBonus += 1 * mult;
		}
	},
};
