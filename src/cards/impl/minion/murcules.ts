import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { OnMinionKilledInput } from '../../../simulation/attack';
import { modifyStats } from '../../../simulation/stats';
import { OnMinionKilledCard } from '../../card.interface';

export const Murcules: OnMinionKilledCard = {
	cardIds: [CardIds.Murcules_BG27_023, CardIds.Murcules_BG27_023_G],
	onMinionKilled: (minion: BoardEntity, input: OnMinionKilledInput) => {
		const mult = minion.cardId === CardIds.Murcules_BG27_023_G ? 2 : 1;
		const murculesTarget = pickRandom(input.attackingHero.hand.filter((e) => !!e?.cardId && !!e.maxHealth));
		if (murculesTarget) {
			modifyStats(
				murculesTarget,
				minion,
				2 * mult,
				2 * mult,
				input.attackingBoard,
				input.attackingHero,
				input.gameState,
			);
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
