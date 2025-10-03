import { BoardTrinket } from '../../../bgs-player-entity';
import { CardIds } from '../../../services/card-ids';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { StartOfCombatCard } from '../../card.interface';

export const Tentacular: StartOfCombatCard = {
	startOfCombatTiming: 'start-of-combat',
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		input.playerEntity.heroPowers.find((h) => h.cardId === CardIds.Ozumat_Tentacular).activated = false;
		input.playerEntity.heroPowers.find((h) => h.cardId === CardIds.Ozumat_Tentacular).ready = true;
		return { hasTriggered: true, shouldRecomputeCurrentAttacker: false };
	},
};
