import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { OnAttackCard } from '../../card.interface';

export const SanguineRefiner: OnAttackCard = {
	cardIds: [CardIds.SanguineRefiner_BG33_885, CardIds.SanguineRefiner_BG33_885_G],
	onAnyMinionAttack: (minion: BoardEntity, input: OnAttackInput) => {
		if (input.attacker !== minion) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}

		const mult = minion.cardId === CardIds.SanguineRefiner_BG33_885_G ? 2 : 1;
		input.attackingHero.globalInfo.BloodGemAttackBonus += 1 * mult;
		input.attackingHero.globalInfo.BloodGemHealthBonus += 2 * mult;
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
