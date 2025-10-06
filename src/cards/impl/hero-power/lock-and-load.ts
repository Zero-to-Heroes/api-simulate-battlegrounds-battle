import { CardIds } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { StartOfCombatCard } from '../../card.interface';

export const LoackAndLoad: StartOfCombatCard = {
	cardIds: [CardIds.LockAndLoadToken_BG22_HERO_000p_Alt],
	// Happens before Wingmen (so before Illidan)
	// 33.6 https://replays.firestoneapp.com/?reviewId=9c801dbe-b626-49e0-a08c-b8f7cc2a8077&turn=3&action=0
	startOfCombatTiming: 'pre-combat',
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		input.playerEntity.heroPowers
			.filter((heroPower) => heroPower.cardId === CardIds.LockAndLoadToken_BG22_HERO_000p_Alt)
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
