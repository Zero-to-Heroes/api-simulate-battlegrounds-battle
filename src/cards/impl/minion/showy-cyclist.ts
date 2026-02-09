import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { addStatsToBoard } from '../../../utils';
import { DeathrattleSpawnCard } from '../../card.interface';

export const ShowyCyclist: DeathrattleSpawnCard = {
	cardIds: [CardIds.ShowyCyclist_BG31_925, CardIds.ShowyCyclist_BG31_925_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const base = minion.cardId === CardIds.ShowyCyclist_BG31_925_G ? 4 : 2;
		// Can be null when created in game
		// This is not exact, and the actual info should somehow come from the game state, but at least we
		// prevent issues
		const baseBuff = minion.scriptDataNum2 ?? base;
		// The info is already included in the scriptDataNum2
		const mult = 1;
		const buff = baseBuff * mult;
		addStatsToBoard(
			minion,
			input.boardWithDeadEntity,
			input.boardWithDeadEntityHero,
			buff,
			buff,
			input.gameState,
			Race[Race.NAGA],
		);
		return [];
	},
};
