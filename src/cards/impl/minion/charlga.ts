import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { playBloodGemsOn } from '../../../simulation/blood-gems';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const Charlga: EndOfTurnCard = {
	cardIds: [CardIds.Charlga_BG20_303, CardIds.Charlga_BG20_303_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.Charlga_BG20_303 ? 1 : 2;
		const targets = input.board.filter((e) => e.entityId !== minion.entityId);
		for (const neighbor of targets) {
			playBloodGemsOn(minion, neighbor, 1 * mult, input.board, input.hero, input.gameState, true);
		}
	},
};
