import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleSpawnCard } from '../../card.interface';

export const FriendlyGeist: DeathrattleSpawnCard = {
	cardIds: [CardIds.FriendlyGeist_BG32_880, CardIds.FriendlyGeist_BG32_880_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === CardIds.FriendlyGeist_BG32_880_G ? 2 : 1;
		input.boardWithDeadEntityHero.globalInfo.TavernSpellAttackBuff += 1 * mult;
		return [];
	},
};
