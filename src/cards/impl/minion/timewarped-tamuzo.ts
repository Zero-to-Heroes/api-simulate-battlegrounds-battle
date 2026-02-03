import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnOtherSpawnInput } from '../../../simulation/add-minion-to-board';
import { setEntityStats } from '../../../simulation/stats';
import { AfterOtherSpawnedCard } from '../../card.interface';

export const TimewarpedTamuzo: AfterOtherSpawnedCard = {
	cardIds: [CardIds.TimewarpedTamuzo_BG34_Giant_595, CardIds.TimewarpedTamuzo_BG34_Giant_595_G],
	afterOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput) => {
		const mult = minion.cardId === CardIds.TimewarpedTamuzo_BG34_Giant_595_G ? 2 : 1;
		// modifyStats(
		// 	input.spawned,
		// 	minion,
		// 	input.spawned.attack * mult,
		// 	input.spawned.maxHealth * mult,
		// 	input.board,
		// 	input.hero,
		// 	input.gameState,
		// );
		setEntityStats(
			input.spawned,
			input.spawned.attack + input.spawned.attack * mult,
			input.spawned.health + input.spawned.maxHealth * mult,
			input.board,
			input.hero,
			input.gameState,
		);
	},
};
