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
			2 * (input.hero.globalInfo.BeetleAttackBuff ?? 0),
			1 * (input.hero.globalInfo.BeetleHealthBuff ?? 0),
			input.playerBoard,
			input.hero,
			input.board,
		);
	},
	onDespawned: (minion: BoardEntity, input: OnDespawnInput) => {
		minion.attack = Math.max(0, minion.attack - input.hero.globalInfo.BeetleAttackBuff);
		minion.health = Math.max(1, minion.health - input.hero.globalInfo.BeetleHealthBuff);
	},
};
