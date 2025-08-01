import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { OnAttackCard } from '../../card.interface';

export const VengefulProtector: OnAttackCard = {
	cardIds: [CardIds.VengefulProtector_BG33_247, CardIds.VengefulProtector_BG33_247_G],
	onAnyMinionAttack: (minion: BoardEntity, input: OnAttackInput) => {
		if (input.attacker !== minion) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}

		const mult = minion.cardId === CardIds.VengefulProtector_BG33_247_G ? 2 : 1;
		const candidates = input.attackingBoard.filter((e) => e !== minion);
		for (const target of candidates) {
			modifyStats(target, minion, 3 * mult, 3 * mult, input.attackingBoard, input.attackingHero, input.gameState);
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
