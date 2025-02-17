import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { dealDamageToRandomEnemy } from '../../../simulation/attack';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleEffectCard } from '../../card.interface';

export const Baneling: DeathrattleEffectCard = {
	cardIds: [TempCardIds.Baneling, TempCardIds.Baneling_G],
	deathrattleEffect: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const target = pickRandom(input.otherBoard);
		if (!!target) {
			const damage = minion.attack;
			dealDamageToRandomEnemy(
				input.otherBoard,
				input.boardWithDeadEntityHero,
				minion,
				damage,
				input.boardWithDeadEntity,
				input.boardWithDeadEntityHero,
				input.gameState,
			);
		}
	},
};
