import { CardIds } from '../../../services/card-ids';
import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnOtherSpawnInput } from '../../../simulation/add-minion-to-board';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { OnOtherSpawnedCard } from '../../card.interface';

export const NoisulOfTheManyFaces: OnOtherSpawnedCard = {
	cardIds: [CardIds.NoisulOfTheManyFaces_BG32_325, CardIds.NoisulOfTheManyFaces_BG32_325_G],
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
		const targets = input.board.filter((e) =>
			hasCorrectTribe(e, input.hero, Race.UNDEAD, input.gameState.anomalies, input.gameState.allCards),
		);
		const mult = minion.cardId === CardIds.NoisulOfTheManyFaces_BG32_325_G ? 2 : 1;
		for (const target of targets) {
			modifyStats(target, minion, 2 * mult, 1 * mult, input.board, input.hero, input.gameState);
		}
	},
};
