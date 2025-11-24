import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { getNeighbours } from '../../../simulation/attack';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { hasCorrectTribe } from '../../../utils';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const TimewarpedSensei: EndOfTurnCard = {
	cardIds: [TempCardIds.TimewarpedSensei, TempCardIds.TimewarpedSensei_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedSensei_G ? 2 : 1;
		const neighbours = getNeighbours(input.board, minion);
		for (const neighbour of neighbours) {
			if (
				hasCorrectTribe(neighbour, input.hero, Race.MECH, input.gameState.anomalies, input.gameState.allCards)
			) {
				modifyStats(neighbour, minion, 3 * mult, 2 * mult, input.board, input.hero, input.gameState);
			}
		}
	},
};
