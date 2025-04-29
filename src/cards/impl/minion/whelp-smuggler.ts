import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { modifyStats, OnStatsChangedInput } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { OnStatsChangedCard } from '../../card.interface';

let callStackDepth = 0; // Global variable to track call stack depth

export const WhelpSmuggler: OnStatsChangedCard = {
	cardIds: [CardIds.WhelpSmuggler_BG21_013, CardIds.WhelpSmuggler_BG21_013_G],
	onStatsChanged: (minion: BoardEntity, input: OnStatsChangedInput) => {
		callStackDepth++;
		if (
			hasCorrectTribe(
				input.target,
				input.hero,
				Race.DRAGON,
				input.gameState.anomalies,
				input.gameState.allCards,
			) &&
			input.attackAmount > 0
		) {
			const buff = minion.cardId === CardIds.WhelpSmuggler_BG21_013_G ? 2 : 1;
			modifyStats(input.target, minion, 0, buff, input.board, input.hero, input.gameState);
		}
		callStackDepth--;
	},
};
