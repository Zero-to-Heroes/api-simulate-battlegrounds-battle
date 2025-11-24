import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { StartOfCombatCard } from '../../card.interface';

export const TimewarpedPromoDrake: StartOfCombatCard = {
	cardIds: [TempCardIds.TimewarpedPromoDrake, TempCardIds.TimewarpedPromoDrake_G],
	startOfCombatTiming: 'start-of-combat',
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedPromoDrake_G ? 2 : 1;
		const buff = minion.scriptDataNum1 ?? 2 * mult;
		const targets = input.playerBoard;
		for (const entity of targets) {
			modifyStats(entity, minion, buff, buff, input.playerBoard, input.playerEntity, input.gameState);
		}
		return true;
	},
};
