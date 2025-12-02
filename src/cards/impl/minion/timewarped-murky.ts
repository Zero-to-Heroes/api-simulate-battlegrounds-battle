import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { modifyStats } from '../../../simulation/stats';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const TimewarpedMurky: EndOfTurnCard = {
	cardIds: [CardIds.TimewarpedMurky_BG34_Giant_206, CardIds.TimewarpedMurky_BG34_Giant_206_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.TimewarpedMurky_BG34_Giant_206_G ? 2 : 1;
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
