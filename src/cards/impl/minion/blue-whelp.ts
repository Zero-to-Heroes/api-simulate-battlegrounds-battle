import { BoardEntity } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { TempCardIds } from '../../../temp-card-ids';
import { OnAttackCard } from '../../card.interface';

export const BlueWhelp: OnAttackCard = {
	cardIds: [TempCardIds.BlueWhelp, TempCardIds.BlueWhelp_G],
	onAnyMinionAttack: (minion: BoardEntity, input: OnAttackInput) => {
		if (input.attacker !== minion) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}

		const mult = minion.cardId === TempCardIds.BlueWhelp_G ? 2 : 1;
		input.attackingHero.globalInfo.TavernSpellHealthBuff += 1 * mult;
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
