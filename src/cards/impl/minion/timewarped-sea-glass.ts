import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { DefaultChargesCard, RallyCard } from '../../card.interface';

export const TimewarpedSeaGlass: RallyCard & DefaultChargesCard = {
	cardIds: [CardIds.TimewarpedSeaGlass_BG34_Giant_110, CardIds.TimewarpedSeaGlass_BG34_Giant_110_G],
	defaultCharges: (minion: BoardEntity) => 2,
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		if (minion.abiityChargesLeft <= 0) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}
		minion.abiityChargesLeft--;
		const mult = minion.cardId === CardIds.TimewarpedSeaGlass_BG34_Giant_110_G ? 2 : 1;
		modifyStats(
			input.attacker,
			minion,
			minion.attack * mult,
			minion.health * mult,
			input.attackingBoard,
			input.attackingHero,
			input.gameState,
		);
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
