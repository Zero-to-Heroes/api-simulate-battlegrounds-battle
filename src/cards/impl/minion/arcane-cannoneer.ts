import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { dealDamageToMinion } from '../../../simulation/attack';
import { OnAttackInput } from '../../../simulation/on-attack';
import { OnAttackCard } from '../../card.interface';

export const ArcaneCannoneer: OnAttackCard = {
	cardIds: [CardIds.ArcaneCannoneer_BG31_928, CardIds.ArcaneCannoneer_BG31_928_G],
	onAttack: (minion: BoardEntity, input: OnAttackInput): { dmgDoneByAttacker: number; dmgDoneByDefender: number } => {
		if (minion !== input.attacker) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}
		const baseBuff = minion.scriptDataNum2;
		const mult = minion.cardId === CardIds.ArcaneCannoneer_BG31_928_G ? 2 : 1;
		const buff = baseBuff * mult;
		const dmg = dealDamageToMinion(
			input.defendingEntity,
			input.defendingBoard,
			input.defendingHero,
			minion,
			1 * buff,
			input.attackingBoard,
			input.attackingHero,
			input.gameState,
		);
		return { dmgDoneByAttacker: dmg, dmgDoneByDefender: 0 };
	},
};
