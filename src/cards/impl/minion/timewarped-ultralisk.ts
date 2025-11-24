import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { StartOfCombatCard } from '../../card.interface';

export const TimewarpedUltralisk: StartOfCombatCard = {
	cardIds: [TempCardIds.TimewarpedUltralisk, TempCardIds.TimewarpedUltralisk_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput): boolean => {
		// We add the stats, so mults are -1
		const multiplier = minion.cardId === TempCardIds.TimewarpedUltralisk_G ? 2 : 1;
		modifyStats(
			minion,
			minion,
			multiplier * minion.attack,
			multiplier * minion.health,
			input.playerBoard,
			input.playerEntity,
			input.gameState,
		);
		return true;
	},
};
