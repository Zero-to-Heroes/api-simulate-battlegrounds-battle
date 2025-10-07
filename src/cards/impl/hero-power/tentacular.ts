import { BoardTrinket } from '../../../bgs-player-entity';
import { CardIds } from '../../../services/card-ids';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { StartOfCombatCard } from '../../card.interface';

export const Tentacular: StartOfCombatCard = {
	// Triggers before Illidan
	// 33.6 https://replays.firestoneapp.com/?reviewId=b1ad080a-cfd6-4f73-818f-801acc4c5983&turn=9&action=1
	startOfCombatTiming: 'pre-combat',
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		input.playerEntity.heroPowers.find((h) => h.cardId === CardIds.Ozumat_Tentacular).activated = false;
		input.playerEntity.heroPowers.find((h) => h.cardId === CardIds.Ozumat_Tentacular).ready = true;
		return { hasTriggered: true, shouldRecomputeCurrentAttacker: false };
	},
};
