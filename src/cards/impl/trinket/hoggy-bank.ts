import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { hasCorrectTribe } from '../../../utils';

export const HoggyBank = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		input.playerBoard
			.filter((e) =>
				hasCorrectTribe(
					e,
					input.playerEntity,
					Race.QUILBOAR,
					input.gameState.anomalies,
					input.gameState.allCards,
				),
			)
			.forEach((e) => {
				e.enchantments = e.enchantments ?? [];
				e.enchantments.push({
					cardId: CardIds.HoggyBank_GemInTheBankEnchantment_BG30_MagicItem_411e,
					originEntityId: trinket.entityId,
					repeats: 1,
					timing: input.gameState.sharedState.currentEntityId++,
				});
			});
		return true;
	},
};
