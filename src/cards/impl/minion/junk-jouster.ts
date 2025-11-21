import { BoardEntity } from '../../../board-entity';
import { OnBeforeMagnetizeInput } from '../../../simulation/magnetize';
import { TempCardIds } from '../../../temp-card-ids';
import { addStatsToBoard } from '../../../utils';
import { OnBeforeMagnetizeCard } from '../../card.interface';

export const JunkJouster: OnBeforeMagnetizeCard = {
	cardIds: [TempCardIds.JunkJouster, TempCardIds.JunkJouster_G],
	onBeforeMagnetize: (entity: BoardEntity, input: OnBeforeMagnetizeInput) => {
		// Only when magnetized to this
		if (input.magnetizeTarget !== entity) {
			return;
		}
		const mult = entity.cardId === TempCardIds.JunkJouster_G ? 2 : 1;
		addStatsToBoard(entity, input.board, input.hero, 3 * mult, 1 * mult, input.gameState);
	},
};
