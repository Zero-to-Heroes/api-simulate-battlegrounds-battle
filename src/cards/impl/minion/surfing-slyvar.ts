import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { getNeighbours } from '../../../simulation/attack';
import { modifyStats } from '../../../simulation/stats';
import { isGolden } from '../../../utils';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const SurfingSylvar: EndOfTurnCard = {
	cardIds: [CardIds.SurfingSylvar_BG32_235, CardIds.SurfingSylvar_BG32_235_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.SurfingSylvar_BG32_235_G ? 2 : 1;
		const goldenMinions = input.board.filter((e) => isGolden(e.cardId, input.gameState.allCards)).length;
		const neighbours = getNeighbours(input.board, minion);
		for (let i = 0; i < goldenMinions + 1; i++) {
			neighbours.forEach((target) =>
				modifyStats(target, minion, 1 * mult, 0, input.board, input.hero, input.gameState),
			);
		}
	},
};
