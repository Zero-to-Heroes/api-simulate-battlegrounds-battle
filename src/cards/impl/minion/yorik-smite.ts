import { BoardEntity } from '../../../board-entity';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { isGolden } from '../../../utils';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const YorikSmite: EndOfTurnCard = {
	cardIds: [TempCardIds.YorikSmite, TempCardIds.YorikSmite_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === TempCardIds.YorikSmite_G ? 2 : 1;
		for (const target of input.board) {
			const buff = isGolden(target.cardId, input.gameState.allCards) ? 4 : 1;
			modifyStats(target, minion, buff * mult, buff * mult, input.board, input.hero, input.gameState);
		}
	},
};
