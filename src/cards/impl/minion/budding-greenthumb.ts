import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { getNeighbours } from '../../../simulation/attack';
import { AvengeInput } from '../../../simulation/avenge';
import { modifyStats } from '../../../simulation/stats';
import { AvengeCard } from '../../card.interface';

export const BuddingGreenthumb: AvengeCard = {
	cardIds: [CardIds.BuddingGreenthumb_BG21_030, CardIds.BuddingGreenthumb_BG21_030_G],
	baseAvengeValue: (cardId: string) => 3,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const mult = minion.cardId === CardIds.BuddingGreenthumb_BG21_030_G ? 2 : 1;
		const neighbours = getNeighbours(input.board, minion);
		neighbours.forEach((entity) => {
			modifyStats(entity, minion, 2 * mult, 2 * mult, input.board, input.hero, input.gameState);
		});
	},
};
