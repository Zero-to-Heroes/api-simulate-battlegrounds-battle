import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { modifyStats, OnStatsChangedInput } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { OnStatsChangedCard } from '../../card.interface';

export const WrathscaleRogue: OnStatsChangedCard = {
	cardIds: [CardIds.WrathscaleRogue_BG33_920, CardIds.WrathscaleRogue_BG33_920_G],
	onStatsChanged: (minion: BoardEntity, input: OnStatsChangedInput) => {
		if (
			input.target !== minion &&
			hasCorrectTribe(input.target, input.hero, Race.NAGA, input.gameState.anomalies, input.gameState.allCards) &&
			input.healthAmount > 0
		) {
			const mult = minion.cardId === CardIds.WrathscaleRogue_BG33_920_G ? 2 : 1;
			for (let i = 0; i < mult; i++) {
				modifyStats(input.target, minion, input.healthAmount, 0, input.board, input.hero, input.gameState);
			}
		}
	},
};
