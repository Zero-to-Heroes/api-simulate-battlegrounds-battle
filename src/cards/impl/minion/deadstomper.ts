import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnOtherSpawnAuraInput } from '../../../simulation/add-minion-to-board';
import { modifyStats } from '../../../simulation/stats';
import { AfterOtherSpawnedCard } from '../../card.interface';

export const Deadstomper: AfterOtherSpawnedCard = {
	cardIds: [CardIds.Deadstomper_BG28_634, CardIds.Deadstomper_BG28_634_G],
	afterOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnAuraInput) => {
		if (minion.entityId !== input.spawned.entityId) {
			const mult = minion.cardId === CardIds.Deadstomper_BG28_634_G ? 2 : 1;
			input.board.forEach((e) => {
				modifyStats(e, minion, 4 * mult, 0, input.board, input.hero, input.gameState);
			});
		}
	},
};
