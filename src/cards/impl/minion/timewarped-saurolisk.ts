import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleTriggeredCard } from '../../card.interface';

export const TimewarpedSaurolisk: DeathrattleTriggeredCard = {
	cardIds: [TempCardIds.TimewarpedSaurolisk, TempCardIds.TimewarpedSaurolisk_G],
	onDeathrattleTriggered: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedSaurolisk_G ? 2 : 1;
		modifyStats(
			minion,
			minion,
			3 * mult,
			3 * mult,
			input.boardWithDeadEntity,
			input.boardWithDeadEntityHero,
			input.gameState,
		);
		return true;
	},
};
