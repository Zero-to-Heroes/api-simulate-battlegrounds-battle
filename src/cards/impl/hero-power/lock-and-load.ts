import { CardIds } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { StartOfCombatCard } from '../../card.interface';

export const LoackAndLoad: StartOfCombatCard = {
	cardIds: [CardIds.LockAndLoadToken_BG22_HERO_000p_Alt],
	startOfCombatTiming: 'start-of-combat',
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		input.playerEntity.heroPowers
			.filter((heroPower) => heroPower.cardId === CardIds.LockAndLoadToken_BG22_HERO_000p_Alt)
			.forEach((heroPower) => {
				heroPower.ready = true;
			});
		return {
			hasTriggered: true,
			shouldRecomputeCurrentAttacker: false,
		};
	},
};
