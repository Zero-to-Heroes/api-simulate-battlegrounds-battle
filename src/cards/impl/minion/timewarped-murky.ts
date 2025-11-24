import { BoardEntity } from '../../../board-entity';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const TimewarpedMurky: EndOfTurnCard = {
	cardIds: [TempCardIds.TimewarpedMurky, TempCardIds.TimewarpedMurky_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedMurky_G ? 2 : 1;
		const totalBuffs = 1 + input.hero.globalInfo.BattlecriesTriggeredThisGame;
		modifyStats(
			minion,
			minion,
			2 * mult * totalBuffs,
			2 * mult * totalBuffs,
			input.board,
			input.hero,
			input.gameState,
		);
	},
};
