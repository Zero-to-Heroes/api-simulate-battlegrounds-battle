import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnOtherSpawnAuraInput } from '../../../simulation/add-minion-to-board';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { AfterOtherSpawnedCard } from '../../card.interface';

export const Swampstriker: AfterOtherSpawnedCard = {
	cardIds: [CardIds.Swampstriker_BG22_401, CardIds.Swampstriker_BG22_401_G],
	afterOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnAuraInput) => {
		if (minion.entityId !== input.spawned.entityId) {
			const multiplier2 = minion.cardId === CardIds.Swampstriker_BG22_401_G ? 2 : 1;
			const buffAmount2 =
				multiplier2 *
				(hasCorrectTribe(
					input.spawned,
					input.hero,
					Race.MURLOC,
					input.gameState.anomalies,
					input.gameState.allCards,
				)
					? 1
					: 0);
			if (buffAmount2 > 0) {
				modifyStats(minion, minion, buffAmount2, 0, input.board, input.hero, input.gameState);
				input.gameState.spectator.registerPowerTarget(minion, minion, input.board, null, null);
			}
		}
	},
};
