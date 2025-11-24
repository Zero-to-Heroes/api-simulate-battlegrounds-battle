import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
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
		const targets = hasImpulsivePortrait
			? getNeighbours(input.boardWithDeadEntity, input.deadEntity, input.deadEntityIndexFromRight)
			: input.boardWithDeadEntity.filter((e) => e != minion);
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
		return [];
	},
};
