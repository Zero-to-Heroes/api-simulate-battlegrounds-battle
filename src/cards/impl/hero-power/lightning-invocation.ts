import { CardIds } from '../../../services/card-ids';
import { BoardTrinket } from '../../../bgs-player-entity';
import { applyLightningInvocationEnchantment } from '../../../simulation/deathrattle-effects';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { StartOfCombatCard } from '../../card.interface';

export const LightningInvocation: StartOfCombatCard = {
	startOfCombatTiming: 'start-of-combat',
	cardIds: [CardIds.LightningInvocationToken, CardIds.LightningInvocation],
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		for (const heroPower of input.playerEntity.heroPowers) {
			if (LightningInvocation.cardIds.includes(heroPower.cardId) && heroPower.used) {
				applyLightningInvocationEnchantment(
					input.playerBoard,
					input.playerEntity,
					input.playerEntity,
					input.opponentBoard,
					input.opponentEntity,
					input.gameState,
				);
				return true;
			}
		}
	},
};
