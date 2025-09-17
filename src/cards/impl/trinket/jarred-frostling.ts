import { CardIds } from '../../../services/card-ids';
import { Race } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { shuffleArray } from '../../../services/utils';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { hasCorrectTribe } from '../../../utils';

export const JarredFrostling = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		const elementals = shuffleArray(
			input.playerBoard.filter((e) =>
				hasCorrectTribe(
					e,
					input.playerEntity,
					Race.ELEMENTAL,
					input.gameState.anomalies,
					input.gameState.allCards,
				),
			),
		);
		if (!!elementals?.length) {
			const targets = elementals.slice(0, 2);
			targets.forEach((e) => {
				e.enchantments = e.enchantments ?? [];
				e.enchantments.push({
					cardId: CardIds.JarredFrostling_FrostyGlobeEnchantment_BG30_MagicItem_952e,
					originEntityId: trinket.entityId,
					repeats: 1,
					timing: input.gameState.sharedState.currentEntityId++,
				});
				input.gameState.spectator.registerPowerTarget(input.playerEntity, e, input.playerBoard, null, null);
			});
			return true;
		}
	},
};
