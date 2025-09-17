import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { OnOtherSpawnInput } from '../../../simulation/add-minion-to-board';
import { modifyStats } from '../../../simulation/stats';
import { OnOtherSpawnedCard } from '../../card.interface';

export const ThunderingAbomination: OnOtherSpawnedCard = {
	cardIds: [CardIds.ThunderingAbomination_BG30_124, CardIds.ThunderingAbomination_BG30_124_G],
	onOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput) => {
		const abomStatsMultiplier = minion.cardId === CardIds.ThunderingAbomination_BG30_124_G ? 2 : 1;
		modifyStats(
			input.spawned,
			minion,
			abomStatsMultiplier * 3,
			abomStatsMultiplier * 3,
			input.board,
			input.hero,
			input.gameState,
		);
	},
};
