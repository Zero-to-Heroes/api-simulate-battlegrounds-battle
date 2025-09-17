import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { DeathrattleSpawnCard } from '../../card.interface';

export const NestSwarmer: DeathrattleSpawnCard = {
	cardIds: [CardIds.NestSwarmer_BG31_807, CardIds.NestSwarmer_BG31_807_G],
	deathrattleSpawn: (deadEntity: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const numberOfSpawns = deadEntity.cardId === CardIds.NestSwarmer_BG31_807_G ? 6 : 3;
		return simplifiedSpawnEntities(CardIds.BoonOfBeetles_BeetleToken_BG28_603t, numberOfSpawns, input);
	},
};
