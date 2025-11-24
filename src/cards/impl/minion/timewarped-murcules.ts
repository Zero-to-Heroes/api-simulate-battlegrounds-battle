import { BoardEntity } from '../../../board-entity';
import { OnMinionKilledInput } from '../../../simulation/attack';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { OnMinionKilledCard } from '../../card.interface';

export const TimewarpedMurcules: OnMinionKilledCard = {
	cardIds: [TempCardIds.TimewarpedMurcules, TempCardIds.TimewarpedMurcules_G],
	onMinionKilled: (minion: BoardEntity, input: OnMinionKilledInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedMurcules_G ? 2 : 1;
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
