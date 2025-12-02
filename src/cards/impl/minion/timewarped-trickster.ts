import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { getNeighbours } from '../../../simulation/attack';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { modifyStats } from '../../../simulation/stats';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedTrickster: DeathrattleSpawnCard = {
	cardIds: [CardIds.TimewarpedTrickster_BG34_Giant_010, CardIds.TimewarpedTrickster_BG34_Giant_010_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.TimewarpedTrickster_BG34_Giant_010_G ? 2 : 1;
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
					minion.maxAttack,
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
