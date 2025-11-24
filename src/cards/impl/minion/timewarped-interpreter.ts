import { BoardEntity } from '../../../board-entity';
import { OnBeforeMagnetizeInput } from '../../../simulation/magnetize';
import { TempCardIds } from '../../../temp-card-ids';
import { addStatsToBoard } from '../../../utils';
import { OnBeforeMagnetizeCard } from '../../card.interface';

export const TimewarpedInterpreter: OnBeforeMagnetizeCard = {
	cardIds: [TempCardIds.TimewarpedInterpreter, TempCardIds.TimewarpedInterpreter_G],
	onBeforeMagnetize: (entity: BoardEntity, input: OnBeforeMagnetizeInput) => {
		const mult = entity.cardId === TempCardIds.TimewarpedInterpreter_G ? 2 : 1;
		addStatsToBoard(entity, input.board, input.hero, 3 * mult, 1 * mult, input.gameState);
	},
};
