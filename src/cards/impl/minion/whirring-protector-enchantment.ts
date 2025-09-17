import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { RallyCard } from '../../card.interface';

export const WhirringProtectorEnchantment: RallyCard = {
	cardIds: [
		CardIds.WhirringProtector_WhirringProtectorEnchantment_BG33_807e,
		CardIds.WhirringProtector_WhirringProtectorEnchantment_BG33_807_Ge,
	],
	rally: (enchantment: BoardEntity, input: OnAttackInput) => {
		const mult = enchantment.cardId === CardIds.WhirringProtector_WhirringProtectorEnchantment_BG33_807_Ge ? 2 : 1;
		const targets = input.attackingBoard.filter((e) => e !== input.attacker);
		for (const target of targets) {
			modifyStats(target, enchantment, 5 * mult, 0, input.attackingBoard, input.attackingHero, input.gameState);
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
