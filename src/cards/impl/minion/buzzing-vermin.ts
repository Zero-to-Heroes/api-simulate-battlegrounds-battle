import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { DeathrattleSpawnCard } from '../../card.interface';

export const BuzzingVermin: DeathrattleSpawnCard = {
	cardIds: [CardIds.BuzzingVermin_BG31_803, CardIds.BuzzingVermin_BG31_803_G],
	deathrattleSpawn: (deadEntity: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const numberOfSpawns = deadEntity.cardId === CardIds.BuzzingVermin_BG31_803_G ? 2 : 1;
		return simplifiedSpawnEntities(CardIds.BoonOfBeetles_BeetleToken_BG28_603t, numberOfSpawns, input);
	},
};
