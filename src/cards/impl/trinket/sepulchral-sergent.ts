import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { modifyStats, OnStatsChangedInput } from '../../../simulation/stats';
import { DeathrattleSpawnCard, OnStatsChangedCard } from '../../card.interface';

export const SepulchralSergeant: DeathrattleSpawnCard & OnStatsChangedCard = {
	cardIds: [CardIds.SepulchralSergeant_BG34_111, CardIds.SepulchralSergeant_BG34_111_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.SepulchralSergeant_BG34_111_G ? 2 : 1;
		const base = minion.scriptDataNum1 || 1 * mult;
		const buff = base;
		const targets = input.boardWithDeadEntity.filter((e) => e != minion && e.health > 0 && !e.definitelyDead);
		for (const target of targets) {
			modifyStats(
				target,
				minion,
				0,
				buff,
				input.boardWithDeadEntity,
				input.boardWithDeadEntityHero,
				input.gameState,
			);
		}
		return [];
	},
	onStatsChanged: (minion: BoardEntity, input: OnStatsChangedInput) => {
		if (input.target === minion && input.attackAmount > 0) {
			const mult = minion.cardId === CardIds.SepulchralSergeant_BG34_111_G ? 2 : 1;
			minion.scriptDataNum1 = (minion.scriptDataNum1 || 2) + 2 * mult;
		}
	},
};
