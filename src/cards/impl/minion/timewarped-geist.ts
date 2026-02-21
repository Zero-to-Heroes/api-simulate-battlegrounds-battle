import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedGeist: DeathrattleSpawnCard = {
	cardIds: [CardIds.TimewarpedGeist_BG34_Giant_034, CardIds.TimewarpedGeist_BG34_Giant_034_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === CardIds.TimewarpedGeist_BG34_Giant_034_G ? 2 : 1;
		input.boardWithDeadEntityHero.globalInfo.TavernSpellAttackBuff += 2 * mult;
		input.boardWithDeadEntityHero.globalInfo.TavernSpellHealthBuff += 2 * mult;
		return [];
	},
};
