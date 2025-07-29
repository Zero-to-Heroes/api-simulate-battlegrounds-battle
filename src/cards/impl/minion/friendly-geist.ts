import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleSpawnCard } from '../../card.interface';

export const FriendlyGeist: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.FriendlyGeist, TempCardIds.FriendlyGeist_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === TempCardIds.FriendlyGeist_G ? 2 : 1;
		input.boardWithDeadEntityHero.globalInfo.TavernSpellAttackBuff += 1 * mult;
		return [];
	},
};
