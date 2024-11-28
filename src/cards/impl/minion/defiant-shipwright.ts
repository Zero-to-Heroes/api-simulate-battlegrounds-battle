import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnStatsChangedInput } from '../../../simulation/stats';
import { OnStatsChangedCard } from '../../card.interface';

export const DefiantShipwright: OnStatsChangedCard = {
	cardIds: [CardIds.DefiantShipwright_BG21_018, CardIds.DefiantShipwright_BG21_018_G],
	onStatsChanged: (minion: BoardEntity, input: OnStatsChangedInput) => {
		if (minion === input.target && input.attackAmount > 0) {
			const stat = minion.cardId === CardIds.DefiantShipwright_BG21_018_G ? 2 : 1;
			minion.health += stat;
		}
	},
};
