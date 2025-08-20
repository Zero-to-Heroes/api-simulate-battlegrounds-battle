import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { RallyCard } from '../../card.interface';

export const SanguineRefiner: RallyCard = {
	cardIds: [CardIds.SanguineRefiner_BG33_885, CardIds.SanguineRefiner_BG33_885_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === CardIds.SanguineRefiner_BG33_885_G ? 2 : 1;
		input.attackingHero.globalInfo.BloodGemAttackBonus += 1 * mult;
		input.attackingHero.globalInfo.BloodGemHealthBonus += 1 * mult;
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
