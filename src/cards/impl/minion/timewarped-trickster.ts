import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { pickRandomAlive } from '../../../services/utils';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { modifyStats } from '../../../simulation/stats';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedTrickster: DeathrattleSpawnCard = {
	cardIds: [CardIds.TimewarpedTrickster_BG34_Giant_010, CardIds.TimewarpedTrickster_BG34_Giant_010_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.TimewarpedTrickster_BG34_Giant_010_G ? 2 : 1;
		const targets = input.boardWithDeadEntity.filter((e) => e != minion);
		const target = pickRandomAlive(targets);
		if (!!target) {
			for (let j = 0; j < mult; j++) {
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
