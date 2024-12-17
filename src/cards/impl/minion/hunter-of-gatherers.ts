import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnStatsChangedInput } from '../../../simulation/stats';
import { addStatsToBoard } from '../../../utils';
import { OnStatsChangedCard } from '../../card.interface';

export const HunterOfGatherers: OnStatsChangedCard = {
	cardIds: [CardIds.HunterOfGatherers_BG25_027, CardIds.HunterOfGatherers_BG25_027_G],
	onStatsChanged: (minion: BoardEntity, input: OnStatsChangedInput) => {
		if (input.attackAmount > 0 && input.target === minion) {
			addStatsToBoard(
				minion,
				input.board,
				input.hero,
				0,
				minion.cardId === CardIds.HunterOfGatherers_BG25_027_G ? 2 : 1,
				input.gameState,
			);
		}
	},
};
