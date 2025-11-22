import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewrappedScourfin: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.TimewrappedScourfin, TempCardIds.TimewrappedScourfin_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === TempCardIds.TimewrappedScourfin_G ? 2 : 1;
		let target = pickRandom(input.boardWithDeadEntityHero.hand.filter((e) => !e.locked && !!e.maxHealth));
		if (!target) {
			target = pickRandom(input.boardWithDeadEntityHero.hand.filter((e) => !!e.maxHealth));
		}
		if (!!target) {
			modifyStats(
				target,
				minion,
				7 * mult,
				7 * mult,
				input.boardWithDeadEntity,
				input.boardWithDeadEntityHero,
				input.gameState,
			);
			if (!target.locked) {
				target.locked = true;
				return simplifiedSpawnEntities(target.cardId, 1, input, target);
			}
		}
		return [];
	},
};
