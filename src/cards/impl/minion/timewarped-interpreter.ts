import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnBeforeMagnetizeInput } from '../../../simulation/magnetize';
import { addStatsToBoard } from '../../../utils';
import { OnBeforeMagnetizeCard } from '../../card.interface';

export const TimewarpedInterpreter: OnBeforeMagnetizeCard = {
	cardIds: [CardIds.TimewarpedInterpreter_BG34_Giant_120, CardIds.TimewarpedInterpreter_BG34_Giant_120_G],
	onBeforeMagnetize: (entity: BoardEntity, input: OnBeforeMagnetizeInput) => {
		const mult = entity.cardId === CardIds.TimewarpedInterpreter_BG34_Giant_120_G ? 2 : 1;
		addStatsToBoard(entity, input.board, input.hero, 3 * mult, 3 * mult, input.gameState, Race[Race.MECH]);
	},
};
