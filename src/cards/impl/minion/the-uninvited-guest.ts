import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';

export const TheUninvitedGuest = {
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const targetEnchantment =
			minion.cardId === CardIds.TheUninvitedGuest_BG29_875_G
				? CardIds.TheUninvitedGuest_UninvitedEnchantment_BG29_875_Ge
				: CardIds.TheUninvitedGuest_UninvitedEnchantment_BG29_875e;
		input.playerBoard
			.filter((e) => e.entityId != minion.entityId)
			.forEach((e) => {
				e.enchantments = e.enchantments || [];
				if (!e.enchantments.some((e) => e.cardId === targetEnchantment)) {
					e.enchantments.push({
						cardId: targetEnchantment,
						originEntityId: minion.entityId,
						timing: input.gameState.sharedState.currentEntityId++,
					});
				}
			});
		return true;
	},
};
