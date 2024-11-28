import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { getNeighbours } from '../../../simulation/attack';
import { playBloodGemsOn } from '../../../simulation/blood-gems';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const Bannerboar: EndOfTurnCard = {
	cardIds: [CardIds.Bannerboar_BG20_201, CardIds.Bannerboar_BG20_201_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.Bannerboar_BG20_201 ? 1 : 2;
		const neighbors = getNeighbours(input.board, minion);
		for (const neighbor of neighbors) {
			playBloodGemsOn(minion, neighbor, 1 * mult, input.board, input.hero, input.gameState, true);
		}
	},
};
