import { CardIds } from '../../../services/card-ids';
import { BoardTrinket } from '../../../bgs-player-entity';
import { applyFireInvocationEnchantment } from '../../../simulation/deathrattle-effects';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { StartOfCombatCard } from '../../card.interface';

export const FireInvocation: StartOfCombatCard = {
	startOfCombatTiming: 'pre-combat',
	cardIds: [CardIds.FireInvocationToken, CardIds.FireInvocation],
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		for (const heroPower of input.playerEntity.heroPowers) {
			if (FireInvocation.cardIds.includes(heroPower.cardId) && heroPower.used) {
				applyFireInvocationEnchantment(
					input.playerBoard,
					input.playerEntity,
					null,
					input.playerEntity,
					input.gameState,
				);
				return true;
			}
		}
	},
};
