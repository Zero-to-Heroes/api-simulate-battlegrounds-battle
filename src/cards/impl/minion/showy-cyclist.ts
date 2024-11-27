import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { TempCardIds } from '../../../temp-card-ids';
import { addStatsToBoard } from '../../../utils';
import { DeathrattleEffectCard } from '../../card.interface';

export const ShowyCyclist: DeathrattleEffectCard = {
	cardIds: [TempCardIds.ShowyCyclist, TempCardIds.ShowyCyclist_G],
	deathrattleEffect: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const baseBuff = minion.scriptDataNum1;
		const mult = minion.cardId === TempCardIds.ShowyCyclist_G ? 2 : 1;
		const buff = baseBuff * mult;
		addStatsToBoard(
			minion,
			input.boardWithDeadEntity,
			input.boardWithDeadEntityHero,
			1 * buff,
			1 * buff,
			input.gameState,
		);
	},
};
