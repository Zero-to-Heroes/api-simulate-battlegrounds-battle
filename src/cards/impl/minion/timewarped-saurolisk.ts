import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { modifyStats } from '../../../simulation/stats';
import { DeathrattleTriggeredCard } from '../../card.interface';

export const TimewarpedSaurolisk: DeathrattleTriggeredCard = {
	cardIds: [CardIds.TimewarpedSaurolisk_BG34_Giant_202, CardIds.TimewarpedSaurolisk_BG34_Giant_202_G],
	onDeathrattleTriggered: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.TimewarpedSaurolisk_BG34_Giant_202_G ? 2 : 1;
		modifyStats(
			minion,
			minion,
			3 * mult,
			2 * mult,
			input.boardWithDeadEntity,
			input.boardWithDeadEntityHero,
			input.gameState,
		);
		return true;
	},
};
