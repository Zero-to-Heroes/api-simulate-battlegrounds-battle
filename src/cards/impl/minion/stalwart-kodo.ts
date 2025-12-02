import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnOtherSpawnInput } from '../../../simulation/add-minion-to-board';
import { modifyStats } from '../../../simulation/stats';
import { DefaultChargesCard, OnOtherSpawnedCard } from '../../card.interface';

export const StalwartKodo: OnOtherSpawnedCard & DefaultChargesCard = {
	cardIds: [CardIds.StalwartKodo_BG34_322, CardIds.StalwartKodo_BG34_322_G],
	defaultCharges: (entity: BoardEntity) => 3,
	onOtherSpawned: (minion: BoardEntity, input: OnOtherSpawnInput) => {
		const mult = minion.cardId === CardIds.StalwartKodo_BG34_322_G ? 2 : 1;
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
