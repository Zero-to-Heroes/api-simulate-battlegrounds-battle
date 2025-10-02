import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnOtherSpawnInput } from '../../../simulation/add-minion-to-board';
import { modifyStats } from '../../../simulation/stats';
import { AfterOtherSpawnedCard } from '../../card.interface';

export const Tamuzo: AfterOtherSpawnedCard = {
	cardIds: [CardIds.Tamuzo_BG23_HERO_201_Buddy, CardIds.Tamuzo_BG23_HERO_201_Buddy_G],
	afterOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput) => {
		const mult = minion.cardId === CardIds.Tamuzo_BG23_HERO_201_Buddy_G ? 2 : 1;
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
