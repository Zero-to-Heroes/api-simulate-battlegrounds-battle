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
		modifyStats(
			minion,
			multiplier * minion.attack,
			multiplier * minion.health,
			input.playerBoard,
			input.playerEntity,
			input.gameState,
		);
		input.gameState.spectator.registerPowerTarget(
			minion,
			minion,
			input.playerBoard,
			input.playerEntity,
			input.opponentEntity,
		);
		return true;
	},
};
