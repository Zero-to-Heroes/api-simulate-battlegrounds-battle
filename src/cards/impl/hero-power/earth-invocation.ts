import { CardIds } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { applyEarthInvocationEnchantment } from '../../../simulation/deathrattle-effects';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { StartOfCombatCard } from '../../card.interface';

export const EarthInvocation: StartOfCombatCard = {
	startOfCombatTiming: 'pre-combat',
	cardIds: [CardIds.EarthInvocationToken, CardIds.EarthInvocation],
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		for (const heroPower of input.playerEntity.heroPowers) {
			if (EarthInvocation.cardIds.includes(heroPower.cardId) && heroPower.used) {
				applyEarthInvocationEnchantment(input.playerBoard, null, input.playerEntity, input.gameState);
				return true;
			}
		}
	},
};
