import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
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
				// Patch 33.6.2 made it so Wrathscale Rogue does not trigger Sinestra / Whelp Smuggler / Titanic Guardian
				// For now we simply mark is as not triggering stat gain effects, and will refine this later
				modifyStats(
					input.target,
					minion,
					input.healthAmount,
					0,
					input.board,
					input.hero,
					input.gameState,
					false,
				);
			}
		}
	},
};
