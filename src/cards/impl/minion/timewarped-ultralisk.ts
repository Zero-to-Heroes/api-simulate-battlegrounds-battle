import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { StartOfCombatCard } from '../../card.interface';

export const TimewarpedUltralisk: StartOfCombatCard = {
	cardIds: [CardIds.TimewarpedUltralisk_BG34_Treasure_994, CardIds.TimewarpedUltralisk_BG34_Treasure_994_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput): boolean => {
		// We add the stats, so mults are -1
		const multiplier = minion.cardId === CardIds.TimewarpedUltralisk_BG34_Treasure_994_G ? 2 : 1;
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
