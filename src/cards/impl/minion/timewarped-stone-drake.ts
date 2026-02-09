import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { StartOfCombatCard } from '../../card.interface';

export const TimewarpedStoneDrake: StartOfCombatCard = {
	cardIds: [CardIds.TimewarpedStoneDrake_BG34_Giant_675, CardIds.TimewarpedStoneDrake_BG34_Giant_675_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const mult = minion.cardId === CardIds.TimewarpedStoneDrake_BG34_Giant_675_G ? 2 : 1;
		const attackGain = minion.scriptDataNum1;
		const healthGain = minion.scriptDataNum2;
		modifyStats(
			minion,
			minion,
			attackGain * mult,
			healthGain * mult,
			input.playerBoard,
			input.playerEntity,
			input.gameState,
		);
		return true;
	},
};
