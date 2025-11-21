import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnOtherSpawnAuraInput } from '../../../simulation/add-minion-to-board';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { AfterOtherSpawnedCard } from '../../card.interface';

export const Swampstriker: AfterOtherSpawnedCard = {
	cardIds: [CardIds.Swampstriker_BG22_401, CardIds.Swampstriker_BG22_401_G],
	afterOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnAuraInput) => {
		if (
			!hasCorrectTribe(
				input.spawned,
				input.hero,
				Race.MURLOC,
				input.gameState.anomalies,
				input.gameState.allCards,
			)
		) {
			return;
		}

		const mult = minion.cardId === CardIds.Swampstriker_BG22_401_G ? 2 : 1;
		modifyStats(minion, minion, 1 * mult, 0, input.board, input.hero, input.gameState);
		input.gameState.spectator.registerPowerTarget(minion, minion, input.board, null, null);
	},
};
