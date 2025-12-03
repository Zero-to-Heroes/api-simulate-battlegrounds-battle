import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { pickRandomAlive } from '../../../services/utils';
import { getNeighbours } from '../../../simulation/attack';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { modifyStats } from '../../../simulation/stats';
import { DeathrattleSpawnCard } from '../../card.interface';

export const ImpulsiveTrickster: DeathrattleSpawnCard = {
	cardIds: [CardIds.ImpulsiveTrickster_BG21_006, CardIds.ImpulsiveTrickster_BG21_006_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.ImpulsiveTrickster_BG21_006_G ? 2 : 1;
		const hasImpulsivePortrait = input.boardWithDeadEntityHero.trinkets?.some(
			(t) => t.cardId === CardIds.ImpulsivePortrait_BG32_MagicItem_820,
		);
		if (hasImpulsivePortrait) {
			const targets = getNeighbours(input.boardWithDeadEntity, input.deadEntity, input.deadEntityIndexFromRight);
			for (let j = 0; j < mult; j++) {
				for (const target of targets) {
					modifyStats(
						target,
						minion,
						0,
						minion.maxHealth,
						input.boardWithDeadEntity,
						input.boardWithDeadEntityHero,
						input.gameState,
					);
				}
			}
		} else {
			const candidates = input.boardWithDeadEntity.filter((e) => e != minion);
			for (let j = 0; j < mult; j++) {
				const target = pickRandomAlive(candidates);
				modifyStats(
					target,
					minion,
					0,
					minion.maxHealth,
					input.boardWithDeadEntity,
					input.boardWithDeadEntityHero,
					input.gameState,
				);
			}
		}
		return [];
	},
};
