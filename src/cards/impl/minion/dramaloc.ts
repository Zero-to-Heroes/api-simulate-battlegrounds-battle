import { BoardEntity } from '../../../board-entity';
import { pickMultipleRandom } from '../../../services/utils';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleSpawnCard } from '../../card.interface';

export const Dramaloc: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.Dramaloc, TempCardIds.Dramaloc_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === TempCardIds.Dramaloc_G ? 2 : 1;
		const statsSource = input.boardWithDeadEntityHero.hand
			.filter((e) => e.attack != null && !!e.cardId)
			.sort((a, b) => b.attack - a.attack)[0];
		if (!!statsSource) {
			for (let i = 0; i < mult; i++) {
				for (let j = 0; j < 2; j++) {
					const candidates = input.boardWithDeadEntity.filter((e) => e !== minion);
					const targets = pickMultipleRandom(candidates, 2);
					for (const target of targets) {
						modifyStats(
							target,
							minion,
							statsSource.attack,
							statsSource.health,
							input.boardWithDeadEntity,
							input.boardWithDeadEntityHero,
							input.gameState,
						);
					}
				}
			}
		}

		return [];
	},
};
