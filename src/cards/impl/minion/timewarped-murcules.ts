import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnMinionKilledInput } from '../../../simulation/attack';
import { modifyStats } from '../../../simulation/stats';
import { OnMinionKilledCard } from '../../card.interface';

export const TimewarpedMurcules: OnMinionKilledCard = {
	cardIds: [CardIds.TimewarpedMurcules_BG34_Giant_207, CardIds.TimewarpedMurcules_BG34_Giant_207_G],
	onMinionKilled: (minion: BoardEntity, input: OnMinionKilledInput) => {
		const mult = minion.cardId === CardIds.TimewarpedMurcules_BG34_Giant_207_G ? 2 : 1;
		const murculesTarget = input.attackingHero.hand.filter((e) => !!e?.cardId && !!e.maxHealth)[0];
		if (murculesTarget) {
			modifyStats(
				murculesTarget,
				minion,
				3 * mult,
				3 * mult,
				input.attackingBoard,
				input.attackingHero,
				input.gameState,
			);
		}
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
