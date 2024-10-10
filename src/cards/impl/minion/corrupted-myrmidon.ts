import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';

export const CorruptedMyrmidon = {
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
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
