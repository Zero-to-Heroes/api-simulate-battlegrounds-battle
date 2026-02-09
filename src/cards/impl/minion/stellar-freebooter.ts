import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { pickRandomAlive } from '../../../services/utils';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { modifyStats } from '../../../simulation/stats';
import { DeathrattleSpawnCard } from '../../card.interface';

export const StellarFreebooter: DeathrattleSpawnCard = {
	cardIds: [CardIds.StellarFreebooter_BG29_866, CardIds.StellarFreebooter_BG29_866_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const loops = minion.cardId === CardIds.StellarFreebooter_BG29_866_G ? 2 : 1;
		for (let i = 0; i < loops; i++) {
			const target = pickRandomAlive(input.boardWithDeadEntity);
			if (!!target) {
				modifyStats(
					target,
					minion,
					0,
					minion.attack,
					input.boardWithDeadEntity,
					input.boardWithDeadEntityHero,
					input.gameState,
				);
			}
		}
		return [];
	},
};
