import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { addStatsToBoard } from '../../../utils';

export const HummingBird = {
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const multiplier = minion.cardId === CardIds.HummingBird_BG26_805_G ? 2 : 1;
		addStatsToBoard(
			minion,
			input.playerBoard,
			input.playerEntity,
			2 * multiplier,
			0,
			input.gameState,
			Race[Race.BEAST],
		);
		input.playerEntity.globalInfo.GoldrinnBuffAtk += 2 * multiplier;
		return true;
	},
};
