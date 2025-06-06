import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { getNeighbours } from '../../../simulation/attack';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { modifyStats } from '../../../simulation/stats';
import { grantRandomHealth } from '../../../utils';
import { DeathrattleSpawnCard } from '../../card.interface';

export const ImpulsiveTrickster: DeathrattleSpawnCard = {
	cardIds: [CardIds.ImpulsiveTrickster_BG21_006, CardIds.ImpulsiveTrickster_BG21_006_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const tricksterMultiplier = minion.cardId === CardIds.ImpulsiveTrickster_BG21_006_G ? 2 : 1;
		const hasImpulsivePortrait = input.boardWithDeadEntityHero.trinkets?.some(
			(t) => t.cardId === CardIds.ImpulsivePortrait_BG32_MagicItem_820,
		);
		for (let j = 0; j < tricksterMultiplier; j++) {
			if (hasImpulsivePortrait) {
				const neighbours = getNeighbours(
					input.boardWithDeadEntity,
					input.deadEntity,
					input.deadEntityIndexFromRight,
				);
				for (const neighbour of neighbours) {
					modifyStats(
						neighbour,
						minion,
						0,
						minion.maxHealth,
						input.boardWithDeadEntity,
						input.boardWithDeadEntityHero,
						input.gameState,
					);
				}
			} else {
				grantRandomHealth(
					minion,
					input.boardWithDeadEntity,
					input.boardWithDeadEntityHero,
					minion.maxHealth,
					input.gameState,
					true,
				);
			}
		}
		return [];
	},
};
