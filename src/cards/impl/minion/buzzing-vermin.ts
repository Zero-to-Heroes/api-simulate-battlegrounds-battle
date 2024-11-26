import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { spawnEntities } from '../../../simulation/deathrattle-spawns';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleSpawnCard } from '../../card.interface';

export const BuzzingVermin: DeathrattleSpawnCard = {
	deathrattleSpawn: (deadEntity: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const numberOfSpawns = deadEntity.cardId === TempCardIds.BuzzingVermin_G ? 2 : 1;
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
