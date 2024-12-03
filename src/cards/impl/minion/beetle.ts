import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnDespawnInput, OnSpawnInput } from '../../../simulation/add-minion-to-board';
import { modifyStats } from '../../../simulation/stats';
import { OnDespawnedCard, OnSpawnedCard } from '../../card.interface';

export const Beetle: OnSpawnedCard & OnDespawnedCard = {
	cardIds: [CardIds.BoonOfBeetles_BeetleToken_BG28_603t, CardIds.Beetle_BG28_603t_G],
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
