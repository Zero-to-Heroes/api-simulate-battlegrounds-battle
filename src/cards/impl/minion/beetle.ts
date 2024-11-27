import { BoardEntity } from '../../../board-entity';
import { OnDespawnInput, OnSpawnInput } from '../../../simulation/add-minion-to-board';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { OnDespawnedCard, OnSpawnedCard } from '../../card.interface';

export const Beetle: OnSpawnedCard & OnDespawnedCard = {
	cardIds: [TempCardIds.BeetleToken, TempCardIds.BeetleToken_G],
	onSpawned: (minion: BoardEntity, input: OnSpawnInput) => {
		modifyStats(
			minion,
			2 * (input.playerEntity.globalInfo.BeetleAttackBuff ?? 0),
			1 * (input.playerEntity.globalInfo.BeetleHealthBuff ?? 0),
			input.playerBoard,
			input.playerEntity,
			input.gameState,
		);
	},
	onDespawned: (minion: BoardEntity, input: OnDespawnInput) => {
		minion.attack = Math.max(0, minion.attack - input.playerEntity.globalInfo.BeetleAttackBuff);
		minion.health = Math.max(1, minion.health - input.playerEntity.globalInfo.BeetleHealthBuff);
	},
};
