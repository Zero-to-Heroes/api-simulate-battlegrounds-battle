import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleSpawnCard } from '../../card.interface';

export const BuzzingVermin: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.BuzzingVermin, TempCardIds.BuzzingVermin_G],
	deathrattleSpawn: (deadEntity: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const numberOfSpawns = deadEntity.cardId === TempCardIds.BuzzingVermin_G ? 2 : 1;
		return simplifiedSpawnEntities(TempCardIds.BeetleToken, numberOfSpawns, input);
	},
};
