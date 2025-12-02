import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { getNeighbours } from '../../../simulation/attack';
import { modifyStats } from '../../../simulation/stats';
import { isGolden } from '../../../utils';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const TimewarpedSylvar: EndOfTurnCard = {
	cardIds: [CardIds.TimewarpedSylvar_BG34_Giant_021, CardIds.TimewarpedSylvar_BG34_Giant_021_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.TimewarpedSylvar_BG34_Giant_021_G ? 2 : 1;
		const goldenMinions = input.board.filter((e) => isGolden(e.cardId, input.gameState.allCards)).length;
		const neighbours = getNeighbours(input.board, minion);
		for (let i = 0; i < goldenMinions + 1; i++) {
			neighbours.forEach((target) =>
				modifyStats(target, minion, 4 * mult, 4 * mult, input.board, input.hero, input.gameState),
			);
		}
	},
};
