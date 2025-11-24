import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnOtherSpawnInput } from '../../../simulation/add-minion-to-board';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { hasCorrectTribe } from '../../../utils';
import { AfterOtherSpawnedCard } from '../../card.interface';

export const TimewarpedJungleKing: AfterOtherSpawnedCard = {
	cardIds: [TempCardIds.TimewarpedJungleKing, TempCardIds.TimewarpedJungleKing_G],
	afterOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput) => {
		if (
			!hasCorrectTribe(input.spawned, input.hero, Race.BEAST, input.gameState.anomalies, input.gameState.allCards)
		) {
			return;
		}

		const baseBuff = minion.scriptDataNum1 ?? 1;
		const mult = minion.cardId === TempCardIds.TimewarpedJungleKing_G ? 2 : 1;
		modifyStats(
			input.spawned,
			minion,
			2 * baseBuff * mult,
			1 * baseBuff * mult,
			input.board,
			input.hero,
			input.gameState,
		);
	},
};
