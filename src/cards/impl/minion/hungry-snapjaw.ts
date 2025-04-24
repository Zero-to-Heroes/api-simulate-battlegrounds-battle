import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnOtherSpawnAuraInput } from '../../../simulation/add-minion-to-board';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { AfterOtherSpawnedCard } from '../../card.interface';

export const HungrySnapjaw: AfterOtherSpawnedCard = {
	cardIds: [CardIds.HungrySnapjaw_BG26_370, CardIds.HungrySnapjaw_BG26_370_G],
	afterOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnAuraInput) => {
		const mult = minion.cardId === CardIds.HungrySnapjaw_BG26_370_G ? 2 : 1;
		if (
			hasCorrectTribe(
				input.spawned,
				input.hero,
				Race.BEAST,
				input.gameState.anomalies,
				input.gameState.allCards,
			) &&
			minion.entityId !== input.spawned.entityId
		) {
			modifyStats(minion, minion, 0, 1 * mult, input.board, input.hero, input.gameState);
		}
	},
};
