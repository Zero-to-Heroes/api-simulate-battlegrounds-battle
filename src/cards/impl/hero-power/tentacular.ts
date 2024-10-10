import { BoardTrinket } from '../../../bgs-player-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { StartOfCombatCard } from '../../card.interface';

export const Tentacular: StartOfCombatCard = {
	startOfCombatTiming: 'pre-combat',
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		input.playerEntity.heroPowerActivated = false;
		return { hasTriggered: true, shouldRecomputeCurrentAttacker: true };
	},
};
