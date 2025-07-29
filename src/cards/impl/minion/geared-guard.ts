import { BoardEntity } from '../../../board-entity';
import { updateDivineShield } from '../../../keywords/divine-shield';
import { pickRandom } from '../../../services/utils';
import { OnAttackInput } from '../../../simulation/on-attack';
import { TempCardIds } from '../../../temp-card-ids';
import { OnAttackCard } from '../../card.interface';

export const GearedGuard: OnAttackCard = {
	cardIds: [TempCardIds.GearedGuard, TempCardIds.GearedGuard_G],
	onAnyMinionAttack: (minion: BoardEntity, input: OnAttackInput) => {
		if (minion !== input.attacker) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}

		const mult = minion.cardId === TempCardIds.GearedGuard_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			const possibleTargets = input.attackingBoard.filter((e) => e !== minion && !e.divineShield);
			if (possibleTargets.length > 0) {
				const target = pickRandom(possibleTargets);
				updateDivineShield(
					target,
					input.attackingBoard,
					input.attackingHero,
					input.defendingHero,
					true,
					input.gameState,
				);
			}
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
