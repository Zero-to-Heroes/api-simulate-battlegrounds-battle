import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { hasCorrectTribe } from '../../../utils';
import { StartOfCombatCard } from '../../card.interface';

export const SkyPirateFlagbearer: StartOfCombatCard = {
	cardIds: [CardIds.SkyPirateFlagbearer_BG30_119, CardIds.SkyPirateFlagbearer_BG30_119_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		input.playerBoard
			.filter((e) => e.entityId !== minion.entityId)
			.filter((e) => hasCorrectTribe(e, input.playerEntity, Race.PIRATE, input.gameState.allCards))
			.forEach((e) => {
				e.enchantments = e.enchantments || [];
				e.enchantments.push({
					cardId:
						minion.cardId === CardIds.SkyPirateFlagbearer_BG30_119_G
							? CardIds.SkyPirateFlagbearer_FlagbearingEnchantment_BG30_119_Ge
							: CardIds.SkyPirateFlagbearer_FlagbearingEnchantment_BG30_119e,
					originEntityId: minion.entityId,
					timing: input.gameState.sharedState.currentEntityId++,
				});
			});
		return true;
	},
};
