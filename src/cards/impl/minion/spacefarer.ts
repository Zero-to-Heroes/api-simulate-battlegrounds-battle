import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { modifyStats, OnStatsChangedInput } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { hasCorrectTribe } from '../../../utils';
import { OnStatsChangedCard } from '../../card.interface';

export const Spacefarer: OnStatsChangedCard = {
	cardIds: [TempCardIds.Spacefarer, TempCardIds.Spacefarer_G],
	onStatsChanged: (entity: BoardEntity, input: OnStatsChangedInput) => {
		if (input.target === entity) {
			return;
		}
		if (!hasCorrectTribe(input.target, input.hero, Race.PIRATE, input.gameState.allCards)) {
			return;
		}
		const mult = entity.cardId === TempCardIds.Spacefarer_G ? 2 : 1;
		modifyStats(entity, 0, 3 * mult, input.board, input.hero, input.gameState);
	},
};
