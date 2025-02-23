import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { modifyStats, OnStatsChangedInput } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { OnStatsChangedCard } from '../../card.interface';

export const Spacefarer: OnStatsChangedCard = {
	cardIds: [CardIds.Spacefarer_BG31_820, CardIds.Spacefarer_BG31_820_G],
	onStatsChanged: (entity: BoardEntity, input: OnStatsChangedInput) => {
		if (input.target === entity) {
			return;
		}
		if (
			!hasCorrectTribe(input.target, input.hero, Race.PIRATE, input.gameState.anomalies, input.gameState.allCards)
		) {
			return;
		}
		if (input.attackAmount > 0) {
			const mult = entity.cardId === CardIds.Spacefarer_BG31_820_G ? 2 : 1;
			modifyStats(entity, 0, 3 * mult, input.board, input.hero, input.gameState);
		}
	},
};
