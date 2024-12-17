import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnSpawnInput } from '../../../simulation/add-minion-to-board';
import { OnDeathInput } from '../../../simulation/attack';
import { modifyStats } from '../../../simulation/stats';
import { OnDeathCard, OnSpawnedCard } from '../../card.interface';

export const SanlaynScribe: OnSpawnedCard & OnDeathCard = {
	cardIds: [CardIds.SanlaynScribe_BGDUO31_208, CardIds.SanlaynScribe_BGDUO31_208_G],
	onSpawned: (minion: BoardEntity, input: OnSpawnInput) => {
		const mult = minion.cardId === CardIds.SanlaynScribe_BGDUO31_208 ? 1 : 2;
		const statsBonus = mult * input.hero.globalInfo.SanlaynScribesDeadThisGame;
		modifyStats(minion, 4 * statsBonus, 4 * statsBonus, input.board, input.hero, input.gameState);
	},
	onDeath: (minion: BoardEntity, input: OnDeathInput) => {
		input.hero.globalInfo.SanlaynScribesDeadThisGame = input.hero.globalInfo.SanlaynScribesDeadThisGame + 1;
	},
};
