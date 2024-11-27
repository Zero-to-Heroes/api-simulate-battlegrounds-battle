import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { spawnEntities } from '../../../simulation/deathrattle-spawns';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleSpawnCard } from '../../card.interface';

export const NestSwarmer: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.NestSwarmer, TempCardIds.NestSwarmer_G],
	deathrattleSpawn: (deadEntity: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const numberOfSpawns = deadEntity.cardId === TempCardIds.NestSwarmer_G ? 6 : 3;
		return spawnEntities(
			TempCardIds.BeetleToken,
			numberOfSpawns,
			input.boardWithDeadEntity,
			input.boardWithDeadEntityHero,
			input.otherBoard,
			input.otherBoardHero,
			input.gameState.allCards,
			input.gameState.cardsData,
			input.gameState.sharedState,
			input.gameState.spectator,
			deadEntity.friendly,
			false,
		);
	},
};
