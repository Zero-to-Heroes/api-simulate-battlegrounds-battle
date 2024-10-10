import { BoardTrinket } from '../../../bgs-player-entity';
import { applyLightningInvocationEnchantment } from '../../../simulation/deathrattle-effects';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { StartOfCombatCard } from '../../card.interface';

export const LightningInvocation: StartOfCombatCard = {
	startOfCombatTiming: 'pre-combat',
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
