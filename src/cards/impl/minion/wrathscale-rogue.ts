import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { modifyStats, OnStatsChangedInput } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { hasCorrectTribe } from '../../../utils';
import { OnStatsChangedCard } from '../../card.interface';

export const WrathscaleRogue: OnStatsChangedCard = {
	cardIds: [TempCardIds.WrathscaleRogue, TempCardIds.WrathscaleRogue_G],
	onStatsChanged: (minion: BoardEntity, input: OnStatsChangedInput) => {
		if (
			input.target !== minion &&
			hasCorrectTribe(input.target, input.hero, Race.NAGA, input.gameState.anomalies, input.gameState.allCards) &&
			input.healthAmount > 0
		) {
			const mult = minion.cardId === TempCardIds.WrathscaleRogue_G ? 2 : 1;
			for (let i = 0; i < mult; i++) {
				modifyStats(input.target, minion, input.healthAmount, 0, input.board, input.hero, input.gameState);
			}
		}
	},
};
