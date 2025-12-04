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
		// scriptDataNum2 contains the full value: https://replays.firestoneapp.com/?reviewId=c849753c-70bf-4367-8bf4-534d92fe5d15&turn=19&action=1 (0)
		// Looks like it could be the scriptDataNum4 (same URL)=
		const buff = (minion.scriptDataNum4 || 2) * mult;
		const targets = input.playerBoard;
		for (const entity of targets) {
			modifyStats(entity, minion, buff, buff, input.playerBoard, input.playerEntity, input.gameState);
		}
		return true;
	},
};
