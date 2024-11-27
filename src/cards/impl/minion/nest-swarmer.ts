import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleSpawnCard } from '../../card.interface';

export const NestSwarmer: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.NestSwarmer, TempCardIds.NestSwarmer_G],
	deathrattleSpawn: (deadEntity: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const numberOfSpawns = deadEntity.cardId === TempCardIds.NestSwarmer_G ? 6 : 3;
		return simplifiedSpawnEntities(TempCardIds.BeetleToken, numberOfSpawns, input);
	},
};
