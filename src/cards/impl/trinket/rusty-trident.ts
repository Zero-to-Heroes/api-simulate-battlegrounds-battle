import { CardIds } from '../../../services/card-ids';
import { Race } from '@firestone-hs/reference-data';
import { BgsPlayerEntity, BoardTrinket } from '../../../bgs-player-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { hasCorrectTribe } from '../../../utils';
import { StartOfCombatCard } from '../../card.interface';

export const RustyTrident: StartOfCombatCard = {
	cardIds: [CardIds.RustyTrident_BG30_MagicItem_917],
	startOfCombat: (trinket: BoardTrinket | BgsPlayerEntity, input: SoCInput) => {
		input.playerBoard
			.filter((e) =>
				hasCorrectTribe(e, input.playerEntity, Race.NAGA, input.gameState.anomalies, input.gameState.allCards),
			)
			.forEach((e) => {
				e.enchantments = e.enchantments ?? [];
				e.enchantments.push({
					cardId: CardIds.RustyTrident_TridentsTreasureEnchantment_BG30_MagicItem_917e,
					originEntityId: trinket?.entityId ?? 0,
					repeats: 1,
					timing: input.gameState.sharedState.currentEntityId++,
				});
			});
		return true;
	},
};
