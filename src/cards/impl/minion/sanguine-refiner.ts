import { BoardEntity } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { TempCardIds } from '../../../temp-card-ids';
import { OnAttackCard } from '../../card.interface';

export const SanguineRefiner: OnAttackCard = {
	cardIds: [TempCardIds.SanguineRefiner, TempCardIds.SanguineRefiner_G],
	onAnyMinionAttack: (minion: BoardEntity, input: OnAttackInput) => {
		if (input.attacker !== minion) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}

		const mult = minion.cardId === TempCardIds.SanguineRefiner_G ? 2 : 1;
		input.attackingHero.globalInfo.BloodGemAttackBonus += 1 * mult;
		input.attackingHero.globalInfo.BloodGemHealthBonus += 2 * mult;
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
