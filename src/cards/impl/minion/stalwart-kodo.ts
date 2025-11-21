import { BoardEntity } from '../../../board-entity';
import { OnOtherSpawnInput } from '../../../simulation/add-minion-to-board';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { DefaultChargesCard, OnOtherSpawnedCard } from '../../card.interface';

export const StalwartKodo: OnOtherSpawnedCard & DefaultChargesCard = {
	cardIds: [TempCardIds.StalwartKodo, TempCardIds.StalwartKodo_G],
	defaultCharges: (entity: BoardEntity) => 3,
	onOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput) => {
		const mult = minion.cardId === TempCardIds.StalwartKodo_G ? 2 : 1;
		if (minion.abiityChargesLeft > 0) {
			minion.abiityChargesLeft--;
			modifyStats(
				input.spawned,
				minion,
				minion.attack * mult,
				minion.health * mult,
				input.board,
				input.hero,
				input.gameState,
			);
			return;
		}
	},
};
