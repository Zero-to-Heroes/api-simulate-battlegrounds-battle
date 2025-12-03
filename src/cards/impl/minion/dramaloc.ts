import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { pickMultipleRandom } from '../../../services/utils';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { DeathrattleSpawnCard } from '../../card.interface';

export const Dramaloc: DeathrattleSpawnCard = {
	cardIds: [CardIds.Dramaloc_BG34_143, CardIds.Dramaloc_BG34_143_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === CardIds.Dramaloc_BG34_143_G ? 2 : 1;
		const statsSource = input.boardWithDeadEntityHero.hand
			.filter((e) => e.attack != null && !!e.cardId)
			.sort((a, b) => b.attack - a.attack)[0];
		if (!!statsSource) {
			for (let i = 0; i < mult; i++) {
				const candidates = input.boardWithDeadEntity.filter(
					(e) =>
						e !== minion &&
						hasCorrectTribe(
							e,
							input.boardWithDeadEntityHero,
							Race.MURLOC,
							input.gameState.anomalies,
							input.gameState.allCards,
						),
				);
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

		return [];
	},
};
