import { BoardTrinket } from '../../../bgs-player-entity';
import { applyEarthInvocationEnchantment } from '../../../simulation/deathrattle-effects';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { StartOfCombatCard } from '../../card.interface';

export const EarthInvocation: StartOfCombatCard = {
	startOfCombatTiming: 'pre-combat',
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		if (input.playerEntity.heroPowerUsed) {
			applyEarthInvocationEnchantment(input.playerBoard, null, input.playerEntity, input.gameState);
			return true;
		}
	},
};
