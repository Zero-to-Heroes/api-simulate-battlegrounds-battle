import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { StartOfCombatCard } from '../../card.interface';

export const CorruptedMyrmidon: StartOfCombatCard = {
	cardIds: [CardIds.CorruptedMyrmidon_BG23_012, CardIds.CorruptedMyrmidon_BG23_012_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		// We add these stats
		const multiplier = minion.cardId === CardIds.CorruptedMyrmidon_BG23_012_G ? 2 : 1;
		// Tt remembers the "max stats" it had, and adds these, instead of the current ones.
		// // Or alternatively, that the stat gain is computed before other effects happen, then is applied
		// https://replays.firestoneapp.com/?reviewId=10a78c2e-d16d-4593-86c8-15eb4cc81a3e&turn=11&action=1
		// I'll go with the max stats for now, since it's easier to implement
		modifyStats(
			minion,
			minion,
			multiplier * minion.maxAttack,
			multiplier * minion.maxHealth,
			input.playerBoard,
			input.playerEntity,
			input.gameState,
		);
		return true;
	},
};
