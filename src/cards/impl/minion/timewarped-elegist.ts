import { BoardEntity } from '../../../board-entity';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const TimewarpedElegist: EndOfTurnCard = {
	cardIds: [TempCardIds.TimewarpedElegist, TempCardIds.TimewarpedElegist_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedElegist_G ? 2 : 1;
		const targets = [...input.board, ...input.hero.hand];
		for (const target of targets) {
			modifyStats(target, minion, 2 * mult, 1 * mult, input.board, input.hero, input.gameState);
		}
	},
};
