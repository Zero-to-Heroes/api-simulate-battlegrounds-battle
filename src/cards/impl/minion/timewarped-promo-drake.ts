import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { StartOfCombatCard } from '../../card.interface';

export const TimewarpedPromoDrake: StartOfCombatCard = {
	cardIds: [CardIds.TimewarpedPromoDrake_BG34_Giant_088, CardIds.TimewarpedPromoDrake_BG34_Giant_088_G],
	startOfCombatTiming: 'start-of-combat',
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const mult = minion.cardId === CardIds.TimewarpedPromoDrake_BG34_Giant_088_G ? 2 : 1;
		const buff = (minion.scriptDataNum1 ?? 1) * 2 * mult;
		const targets = input.playerBoard;
		for (const entity of targets) {
			modifyStats(entity, minion, buff, buff, input.playerBoard, input.playerEntity, input.gameState);
		}
		return true;
	},
};
