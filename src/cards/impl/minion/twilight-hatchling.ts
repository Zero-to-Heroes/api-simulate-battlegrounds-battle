import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TwilightHatchling: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.TwilightHatchling, TempCardIds.TwilightHatchling_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === TempCardIds.TwilightHatchling_G ? 2 : 1;
		const spawns = simplifiedSpawnEntities(TempCardIds.TwilightWhelp, mult, input);
		spawns.forEach((e) => {
			e.attackImmediately = true;
		});
		return spawns;
	},
};
