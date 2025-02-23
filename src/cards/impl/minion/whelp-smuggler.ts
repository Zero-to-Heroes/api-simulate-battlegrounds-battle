import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { modifyStats, OnStatsChangedInput } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { OnStatsChangedCard } from '../../card.interface';

export const WhelpSmuggler: OnStatsChangedCard = {
	cardIds: [CardIds.WhelpSmuggler_BG21_013, CardIds.WhelpSmuggler_BG21_013_G],
	onStatsChanged: (minion: BoardEntity, input: OnStatsChangedInput) => {
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
			modifyStats(input.target, 0, buff, input.board, input.hero, input.gameState);
			input.gameState.spectator.registerPowerTarget(
				minion,
				input.target,
				input.board,
				input.hero,
				input.otherHero,
			);
		}
	},
};
