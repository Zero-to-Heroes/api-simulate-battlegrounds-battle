import { BoardEntity } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { OnAttackCard } from '../../card.interface';

export const VoidRay: OnAttackCard = {
	cardIds: [TempCardIds.VoidRay, TempCardIds.VoidRay_G],
	onAttack: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === TempCardIds.VoidRay_G ? 2 : 1;
		modifyStats(input.attacker, 5 * mult, 0, input.attackingBoard, input.attackingHero, input.gameState);
		modifyStats(minion, 5 * mult, 0, input.attackingBoard, input.attackingHero, input.gameState);
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
