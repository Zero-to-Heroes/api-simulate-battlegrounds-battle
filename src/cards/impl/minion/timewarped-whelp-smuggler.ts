import { BoardEntity } from '../../../board-entity';
import { modifyStats, OnStatsChangedInput } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { OnStatsChangedCard } from '../../card.interface';

export const TimewarpedWhelpSmuggler: OnStatsChangedCard = {
	cardIds: [TempCardIds.TimewarpedWhelpSmuggler, TempCardIds.TimewarpedWhelpSmuggler_G],
	onStatsChanged: (minion: BoardEntity, input: OnStatsChangedInput) => {
		if (input.attackAmount > 0) {
			const buff = minion.cardId === TempCardIds.TimewarpedWhelpSmuggler_G ? 2 : 1;
			modifyStats(input.target, minion, 0, 1 * buff, input.board, input.hero, input.gameState);
		}
	},
};
