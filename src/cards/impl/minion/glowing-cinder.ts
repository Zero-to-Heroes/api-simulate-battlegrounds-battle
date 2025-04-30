import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleSpawnCard } from '../../card.interface';

export const GlowingCinder: DeathrattleSpawnCard = {
	cardIds: [CardIds.GlowingCinder_BG32_842, CardIds.GlowingCinder_BG32_842_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.GlowingCinder_BG32_842_G ? 2 : 1;
		input.boardWithDeadEntityHero.globalInfo.ElementalAttackBuff += 1 * mult;
		return [];
	},
};
