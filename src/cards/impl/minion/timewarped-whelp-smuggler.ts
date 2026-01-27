import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { modifyStats, OnStatsChangedInput } from '../../../simulation/stats';
import { OnStatsChangedCard } from '../../card.interface';

export const TimewarpedWhelpSmuggler: OnStatsChangedCard = {
	cardIds: [CardIds.TimewarpedWhelpSmuggler_BG34_Giant_064, CardIds.TimewarpedWhelpSmuggler_BG34_Giant_064_G],
	onStatsChanged: (minion: BoardEntity, input: OnStatsChangedInput) => {
		if (input.attackAmount > 0) {
			const buff = minion.cardId === CardIds.TimewarpedWhelpSmuggler_BG34_Giant_064_G ? 2 : 1;
			modifyStats(input.target, minion, 0, 3 * buff, input.board, input.hero, input.gameState);
		}
	},
};
