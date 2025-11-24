import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedGeist: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.TimewarpedGeist, TempCardIds.TimewarpedGeist_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === TempCardIds.TimewarpedGeist_G ? 2 : 1;
		input.boardWithDeadEntityHero.globalInfo.TavernSpellAttackBuff += 1 * mult;
		input.boardWithDeadEntityHero.globalInfo.TavernSpellHealthBuff += 1 * mult;
		return [];
	},
};
