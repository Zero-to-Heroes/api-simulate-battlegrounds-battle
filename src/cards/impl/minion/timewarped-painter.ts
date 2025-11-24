import { BoardEntity } from '../../../board-entity';
import { getNeighbours } from '../../../simulation/attack';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const TimewarpedPainter: EndOfTurnCard = {
	cardIds: [TempCardIds.TimewarpedPainter, TempCardIds.TimewarpedPainter_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const targets = getNeighbours(input.board, minion);
		const mult = minion.cardId === TempCardIds.TimewarpedPainter_G ? 2 : 1;
		const baseBuff = minion.scriptDataNum1 ?? 2;
		for (const target of targets) {
			input.gameState.spectator.registerPowerTarget(minion, target, input.board, input.hero, input.otherHero);
			modifyStats(target, minion, baseBuff * mult, baseBuff * mult, input.board, input.hero, input.gameState);
		}
	},
};
