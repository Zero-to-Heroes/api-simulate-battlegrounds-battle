import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { OnAttackCard } from '../../card.interface';

export const WhirringProtector: OnAttackCard = {
	cardIds: [CardIds.WhirringProtector_BG33_807, CardIds.WhirringProtector_BG33_807_G],
	onAnyMinionAttack: (minion: BoardEntity, input: OnAttackInput) => {
		if (!input.isSelfAttacking) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}

		const mult = minion.cardId === CardIds.WhirringProtector_BG33_807_G ? 2 : 1;
		const targets = input.attackingBoard.filter((e) => e !== minion);
		for (const target of targets) {
			modifyStats(target, minion, 5 * mult, 0, input.attackingBoard, input.attackingHero, input.gameState);
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
