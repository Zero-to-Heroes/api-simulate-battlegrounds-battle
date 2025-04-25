import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { TempCardIds } from '../../../temp-card-ids';
import { AvengeCard } from '../../card.interface';

export const DreamingThornweaver: AvengeCard = {
	cardIds: [TempCardIds.DreamingThornweaver, TempCardIds.DreamingThornweaver_G],
	baseAvengeValue: (cardId: string) => 4,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const mult = minion.cardId === TempCardIds.DreamingThornweaver_G ? 2 : 1;
		if (minion.scriptDataNum2 === 1) {
			input.hero.globalInfo.BloodGemAttackBonus += 1 * mult;
		} else {
			input.hero.globalInfo.BloodGemHealthBonus += 1 * mult;
		}
	},
};
