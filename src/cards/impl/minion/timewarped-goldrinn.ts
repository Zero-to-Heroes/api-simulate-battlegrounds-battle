import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { TempCardIds } from '../../../temp-card-ids';
import { addStatsToBoard } from '../../../utils';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedGoldrinn: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.TimewarpedGoldrinn, TempCardIds.TimewarpedGoldrinn_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedGoldrinn_G ? 2 : 1;
		const goldrinnBuff = 2 * mult;
		addStatsToBoard(
			minion,
			input.boardWithDeadEntity,
			input.boardWithDeadEntityHero,
			goldrinnBuff,
			goldrinnBuff,
			input.gameState,
			Race[Race.BEAST],
		);
		input.boardWithDeadEntityHero.globalInfo.GoldrinnBuffAtk += goldrinnBuff;
		input.boardWithDeadEntityHero.globalInfo.GoldrinnBuffHealth += goldrinnBuff;
		return [];
	},
};
