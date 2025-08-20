import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnOtherSpawnInput } from '../../../simulation/add-minion-to-board';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { OnOtherSpawnedCard } from '../../card.interface';

export const ScourgeHarvester: OnOtherSpawnedCard = {
	cardIds: [CardIds.ScourgeHarvester_BG33_114, CardIds.ScourgeHarvester_BG33_114_G],
	// 2025-08-20:This is bugged today, as it should be able to get revived by the spawns
	// https://replays.firestoneapp.com/?reviewId=dc1a69b7-d93d-4f3a-9878-ddf0bddb3784&turn=19&action=8
	onOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput): void => {
		const mult = minion.cardId === CardIds.ScourgeHarvester_BG33_114_G ? 2 : 1;
		if (
			hasCorrectTribe(input.spawned, input.hero, Race.UNDEAD, input.gameState.anomalies, input.gameState.allCards)
		) {
			modifyStats(
				minion,
				minion,
				input.spawned.attack * mult,
				input.spawned.health * mult,
				input.board,
				input.hero,
				input.gameState,
			);
		}
	},
};
