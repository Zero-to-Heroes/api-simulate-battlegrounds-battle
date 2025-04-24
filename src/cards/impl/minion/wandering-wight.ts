import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnOtherSpawnAuraInput } from '../../../simulation/add-minion-to-board';
import { modifyStats } from '../../../simulation/stats';
import { AfterOtherSpawnedCard } from '../../card.interface';

export const WanderingWight: AfterOtherSpawnedCard = {
	cardIds: [CardIds.WanderingWight_BG31_126, CardIds.WanderingWight_BG31_126_G],
	afterOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnAuraInput) => {
		const mult = minion.cardId === CardIds.WanderingWight_BG31_126 ? 1 : 2;
		modifyStats(input.spawned, minion, 0, input.spawned.attack * mult, input.board, input.hero, input.gameState);
	},
};
