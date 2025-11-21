import { BoardEntity } from '../../../board-entity';
import { updateTaunt } from '../../../keywords/taunt';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TwilightBroodmother: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.TwilightBroodmother, TempCardIds.TwilightBroodmother_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const totalSpawns = minion.cardId === TempCardIds.TwilightBroodmother_G ? 4 : 2;
		const spawns = simplifiedSpawnEntities(TempCardIds.TwilightHatchling, totalSpawns, input);
		spawns.forEach((e) => {
			updateTaunt(
				e,
				true,
				input.boardWithDeadEntity,
				input.boardWithDeadEntityHero,
				input.otherBoardHero,
				input.gameState,
			);
		});
		return spawns;
	},
};
