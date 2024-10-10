import { BoardTrinket } from '../../../bgs-player-entity';
import { applyFireInvocationEnchantment } from '../../../simulation/deathrattle-effects';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';

export const FireInvocation = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		if (input.playerEntity.heroPowerUsed) {
			applyFireInvocationEnchantment(
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
