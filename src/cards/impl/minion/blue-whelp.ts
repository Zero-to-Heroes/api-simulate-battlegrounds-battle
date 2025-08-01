import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { OnAttackCard } from '../../card.interface';

export const BlueWhelp: OnAttackCard = {
	cardIds: [CardIds.BlueWhelp_BG33_924, CardIds.BlueWhelp_BG33_924_G],
	onAnyMinionAttack: (minion: BoardEntity, input: OnAttackInput) => {
		if (input.attacker !== minion) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}

		const mult = minion.cardId === CardIds.BlueWhelp_BG33_924_G ? 2 : 1;
		input.attackingHero.globalInfo.TavernSpellHealthBuff += 1 * mult;
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
