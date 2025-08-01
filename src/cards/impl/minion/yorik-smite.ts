import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { modifyStats } from '../../../simulation/stats';
import { isGolden } from '../../../utils';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const YorikSmite: EndOfTurnCard = {
	cardIds: [CardIds.YorikSmite_BG33_827, CardIds.YorikSmite_BG33_827_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.YorikSmite_BG33_827_G ? 2 : 1;
		for (const target of input.board) {
			const buff = isGolden(target.cardId, input.gameState.allCards) ? 4 : 1;
			modifyStats(target, minion, buff * mult, buff * mult, input.board, input.hero, input.gameState);
		}
	},
};
