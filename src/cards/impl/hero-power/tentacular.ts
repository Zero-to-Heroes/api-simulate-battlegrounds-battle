import { BoardTrinket } from '../../../bgs-player-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';

export const Tentacular = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		input.playerEntity.heroPowerActivated = false;
		return { hasTriggered: true, shouldRecomputeCurrentAttacker: true };
	},
};
