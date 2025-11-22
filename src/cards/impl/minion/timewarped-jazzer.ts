import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedJazzer: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.TimewarpedJazzer, TempCardIds.TimewarpedJazzer_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedJazzer_G ? 2 : 1;
		input.boardWithDeadEntityHero.globalInfo.BloodGemHealthBonus += 1 * mult;
		return [];
	},
};
