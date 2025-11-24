import { BoardEntity } from '../../../board-entity';
import { OnOtherSpawnInput } from '../../../simulation/add-minion-to-board';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { AfterOtherSpawnedCard } from '../../card.interface';

export const TimewarpedTamuzo: AfterOtherSpawnedCard = {
	cardIds: [TempCardIds.TimewarpedTamuzo, TempCardIds.TimewarpedTamuzo_G],
	afterOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedTamuzo_G ? 2 : 1;
		modifyStats(
			input.spawned,
			minion,
			input.spawned.attack * mult,
			input.spawned.maxHealth * mult,
			input.board,
			input.hero,
			input.gameState,
		);
	},
};
