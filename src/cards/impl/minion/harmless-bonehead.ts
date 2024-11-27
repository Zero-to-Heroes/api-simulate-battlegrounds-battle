import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { DeathrattleSpawnCard } from '../../card.interface';

export const HarmlessBonehead: DeathrattleSpawnCard = {
	cardIds: [CardIds.HarmlessBonehead_BG28_300, CardIds.HarmlessBonehead_BG28_300_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === CardIds.HarmlessBonehead_BG28_300_G ? 2 : 1;
		return simplifiedSpawnEntities(CardIds.SkeletonToken, 2 * mult, input);
	},
};
