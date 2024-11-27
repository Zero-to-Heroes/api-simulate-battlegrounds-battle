import { BoardEntity } from '../../../board-entity';
import { getNeighbours } from '../../../simulation/attack';
import { playBloodGemsOn } from '../../../simulation/blood-gems';
import { TempCardIds } from '../../../temp-card-ids';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const Banerboar: EndOfTurnCard = {
	cardIds: [TempCardIds.Banerboar, TempCardIds.Banerboar_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === TempCardIds.Banerboar ? 1 : 2;
		const neighbors = getNeighbours(input.board, minion);
		for (const neighbor of neighbors) {
			playBloodGemsOn(minion, neighbor, 1 * mult, input.board, input.hero, input.gameState, true);
		}
	},
};
