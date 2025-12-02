import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedJazzer: DeathrattleSpawnCard = {
	cardIds: [CardIds.TimewarpedJazzer_BG34_Giant_306, CardIds.TimewarpedJazzer_BG34_Giant_306_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.TimewarpedJazzer_BG34_Giant_306_G ? 2 : 1;
		input.boardWithDeadEntityHero.globalInfo.BloodGemHealthBonus += 1 * mult;
		return [];
	},
};
