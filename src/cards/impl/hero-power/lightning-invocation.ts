import { BoardTrinket } from '../../../bgs-player-entity';
import { applyLightningInvocationEnchantment } from '../../../simulation/deathrattle-effects';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';

export const LightningInvocation = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		if (input.playerEntity.heroPowerUsed) {
			applyLightningInvocationEnchantment(
				input.playerBoard,
				input.playerEntity,
				null,
				input.opponentBoard,
				input.opponentEntity,
				input.gameState,
			);
			return true;
		}
	},
};
