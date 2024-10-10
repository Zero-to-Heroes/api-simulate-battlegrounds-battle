import { BoardTrinket } from '../../../bgs-player-entity';
import { applyWaterInvocationEnchantment } from '../../../simulation/deathrattle-effects';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';

export const WaterInvocation = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		if (input.playerEntity.heroPowerUsed) {
			applyWaterInvocationEnchantment(
				input.playerBoard,
				input.playerEntity,
				null,
				input.playerEntity,
				input.gameState,
			);
			return true;
		}
	},
};
