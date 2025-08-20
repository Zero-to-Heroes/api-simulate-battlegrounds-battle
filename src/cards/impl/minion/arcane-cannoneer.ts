import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { dealDamageToMinion } from '../../../simulation/attack';
import { OnAttackInput } from '../../../simulation/on-attack';
import { RallyCard } from '../../card.interface';

export const ArcaneCannoneer: RallyCard = {
	cardIds: [CardIds.ArcaneCannoneer_BG31_928, CardIds.ArcaneCannoneer_BG31_928_G],
	rally: (minion: BoardEntity, input: OnAttackInput): { dmgDoneByAttacker: number; dmgDoneByDefender: number } => {
		const base = minion.cardId === CardIds.ArcaneCannoneer_BG31_928_G ? 4 : 2;
		const baseBuff = minion.scriptDataNum2 ?? base;
		// The info is already included in the scriptDataNum2
		const mult = 1;
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
