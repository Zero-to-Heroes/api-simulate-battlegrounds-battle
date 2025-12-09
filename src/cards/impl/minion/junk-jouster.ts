import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnBeforeMagnetizeInput } from '../../../simulation/magnetize';
import { addStatsToBoard } from '../../../utils';
import { OnBeforeMagnetizeCard } from '../../card.interface';

export const JunkJouster: OnBeforeMagnetizeCard = {
	cardIds: [CardIds.JunkJouster_BG34_175, CardIds.JunkJouster_BG34_175_G],
	onBeforeMagnetize: (entity: BoardEntity, input: OnBeforeMagnetizeInput) => {
		// Only when magnetized to this
		if (input.magnetizeTarget !== entity) {
			return;
		}
		const mult = entity.cardId === CardIds.JunkJouster_BG34_175_G ? 2 : 1;
		addStatsToBoard(entity, input.board, input.hero, 3 * mult, 2 * mult, input.gameState);
	},
};
