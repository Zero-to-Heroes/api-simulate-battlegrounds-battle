import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { modifyStats } from '../../../simulation/stats';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const LowFlier: EndOfTurnCard = {
	cardIds: [CardIds.LowFlier_BG26_969, CardIds.LowFlier_BG26_969_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.LowFlier_BG26_969_G ? 2 : 1;
		const targets = input.board.filter((e) => e.attack < minion.attack);
		for (const target of targets) {
			modifyStats(target, minion, 1 * mult, 0, input.board, input.hero, input.gameState);
		}
	},
};
