import { CardIds } from '@firestone-hs/reference-data';
import { BgsHeroPower, BoardTrinket } from '../../../bgs-player-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { StartOfCombatCard } from '../../card.interface';

export const FrostwolfFervor: StartOfCombatCard = {
	cardIds: [CardIds.Drekthar_LeadTheFrostwolves],
	startOfCombatTiming: 'pre-combat',
	startOfCombat: (heroPower: BgsHeroPower, input: SoCInput) => {
		// Make sure we don't trigger too soon
		input.playerEntity.heroPowers
			.filter((heroPower) => heroPower.cardId === CardIds.Drekthar_LeadTheFrostwolves)
			.forEach((heroPower) => {
				heroPower.ready = true;
			});
		return {
			hasTriggered: true,
			// Recomputed after the minion attacks
			shouldRecomputeCurrentAttacker: false,
		};
	},
};
