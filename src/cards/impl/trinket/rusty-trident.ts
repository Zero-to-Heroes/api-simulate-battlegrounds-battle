import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { hasCorrectTribe } from '../../../utils';

export const RustyTrident = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		input.playerBoard
			.filter((e) => hasCorrectTribe(e, input.playerEntity, Race.NAGA, input.gameState.allCards))
			.forEach((e) => {
				e.enchantments = e.enchantments ?? [];
				e.enchantments.push({
					cardId: CardIds.RustyTrident_TridentsTreasureEnchantment_BG30_MagicItem_917e,
					originEntityId: trinket.entityId,
					repeats: 1,
					timing: input.gameState.sharedState.currentEntityId++,
				});
			});
		return true;
	},
};
