import { BoardEntity } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { OnAttackCard } from '../../card.interface';

export const WhirringProtectorEnchantment: OnAttackCard = {
	cardIds: [TempCardIds.WhirringProtectorEnchantment, TempCardIds.WhirringProtectorEnchantment_G],
	onAnyMinionAttack: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === TempCardIds.WhirringProtectorEnchantment_G ? 2 : 1;
		const targets = input.attackingBoard.filter((e) => e !== minion);
		for (const target of targets) {
			modifyStats(target, minion, 5 * mult, 0, input.attackingBoard, input.attackingHero, input.gameState);
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
