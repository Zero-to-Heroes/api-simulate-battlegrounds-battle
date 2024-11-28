import { BoardEntity } from '../../../board-entity';
import { dealDamageToMinion } from '../../../simulation/attack';
import { OnAttackInput } from '../../../simulation/on-attack';
import { TempCardIds } from '../../../temp-card-ids';
import { OnAttackCard } from '../../card.interface';

export const ArcaneCannoneer: OnAttackCard = {
	cardIds: [TempCardIds.ArcaneCannoneer, TempCardIds.ArcaneCannoneer_G],
	onAttack: (minion: BoardEntity, input: OnAttackInput): { dmgDoneByAttacker: number; dmgDoneByDefender: number } => {
		if (minion !== input.attacker) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}
		const baseBuff = minion.scriptDataNum1;
		const mult = minion.cardId === TempCardIds.ArcaneCannoneer_G ? 2 : 1;
		const buff = baseBuff * mult;
		dealDamageToMinion(
			input.defendingEntity,
			input.defendingBoard,
			input.defendingHero,
			minion,
			1 * buff,
			input.attackingBoard,
			input.attackingHero,
			input.gameState,
		);
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
