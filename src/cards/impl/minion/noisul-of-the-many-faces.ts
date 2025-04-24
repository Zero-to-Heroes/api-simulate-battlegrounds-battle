import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { shuffleArray } from '../../../services/utils';
import { OnOtherSpawnInput } from '../../../simulation/add-minion-to-board';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { hasCorrectTribe } from '../../../utils';
import { OnOtherSpawnedCard } from '../../card.interface';

export const NoisulOfTheManyFaces: OnOtherSpawnedCard = {
	cardIds: [TempCardIds.NoisulOfTheManyFaces, TempCardIds.NoisulOfTheManyFaces_G],
	onOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput) => {
		if (
			!hasCorrectTribe(
				input.spawned,
				input.hero,
				Race.UNDEAD,
				input.gameState.anomalies,
				input.gameState.allCards,
			)
		) {
			return;
		}
		const undead = input.board.filter((e) =>
			hasCorrectTribe(e, input.hero, Race.UNDEAD, input.gameState.anomalies, input.gameState.allCards),
		);
		const targets = shuffleArray(undead).slice(0, 4);
		const mult = minion.cardId === TempCardIds.NoisulOfTheManyFaces_G ? 2 : 1;
		for (const target of targets) {
			modifyStats(target, minion, 1 * mult, 1 * mult, input.board, input.hero, input.gameState);
		}
	},
};
