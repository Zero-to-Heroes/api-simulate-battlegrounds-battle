import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnOtherSpawnInput } from '../../../simulation/add-minion-to-board';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { hasCorrectTribe } from '../../../utils';
import { OnOtherSpawnedCard } from '../../card.interface';

export const ScourgeHarvester: OnOtherSpawnedCard = {
	cardIds: [TempCardIds.ScourgeHarvester, TempCardIds.ScourgeHarvester_G],
	onOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput): void => {
		const mult = minion.cardId === TempCardIds.ScourgeHarvester_G ? 2 : 1;
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
