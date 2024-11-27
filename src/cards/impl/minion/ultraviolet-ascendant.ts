import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { TempCardIds } from '../../../temp-card-ids';
import { addStatsToBoard } from '../../../utils';
import { StartOfCombatCard } from '../../card.interface';

export const UltravioletAscendant: StartOfCombatCard = {
	cardIds: [TempCardIds.UltravioletAscendant, TempCardIds.UltravioletAscendant_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const currentBuffValue = minion.scriptDataNum1;
		const mult = minion.cardId === TempCardIds.UltravioletAscendant_G ? 2 : 1;
		addStatsToBoard(
			minion,
			input.playerBoard,
			input.playerEntity,
			2 * mult * currentBuffValue,
			1 * mult * currentBuffValue,
			input.gameState,
		);
		return true;
	},
};
