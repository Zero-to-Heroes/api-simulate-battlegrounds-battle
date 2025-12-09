import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { addStatsToBoard } from '../../../utils';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedGoldrinn: DeathrattleSpawnCard = {
	cardIds: [CardIds.TimewarpedGoldrinn_BG34_Giant_362, CardIds.TimewarpedGoldrinn_BG34_Giant_362_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.TimewarpedGoldrinn_BG34_Giant_362_G ? 2 : 1;
		const goldrinnAttackBuff = 3 * mult;
		const goldrinnHealthBuff = 2 * mult;
		addStatsToBoard(
			minion,
			input.boardWithDeadEntity,
			input.boardWithDeadEntityHero,
			goldrinnAttackBuff,
			goldrinnHealthBuff,
			input.gameState,
			Race[Race.BEAST],
		);
		input.boardWithDeadEntityHero.globalInfo.GoldrinnBuffAtk += goldrinnAttackBuff;
		input.boardWithDeadEntityHero.globalInfo.GoldrinnBuffHealth += goldrinnHealthBuff;
		return [];
	},
};
