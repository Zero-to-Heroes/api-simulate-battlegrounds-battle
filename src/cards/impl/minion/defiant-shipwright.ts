import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { modifyStats, OnStatsChangedInput } from '../../../simulation/stats';
import { OnStatsChangedCard } from '../../card.interface';

export const DefiantShipwright: OnStatsChangedCard = {
	cardIds: [CardIds.DefiantShipwright_BG21_018, CardIds.DefiantShipwright_BG21_018_G],
	onStatsChanged: (minion: BoardEntity, input: OnStatsChangedInput) => {
		if (
			minion === input.target &&
			input.attackAmount > 0 &&
			// Protection against Shore Marauder infinite loop
			minion !== input.source &&
			!DefiantShipwright.cardIds.includes(input.source?.cardId)
		) {
			const loops = minion.cardId === CardIds.DefiantShipwright_BG21_018_G ? 2 : 1;
			for (let i = 0; i < loops; i++) {
				modifyStats(minion, minion, 0, 1, input.board, input.hero, input.gameState);
			}
		}
	},
};
