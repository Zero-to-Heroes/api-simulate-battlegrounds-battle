import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { StartOfCombatCard } from '../../card.interface';

export const Ultralisk: StartOfCombatCard = {
	cardIds: [TempCardIds.Ultralisk, TempCardIds.Ultralisk_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput): boolean => {
		const multiplier = minion.cardId === TempCardIds.Ultralisk_G ? 3 : 2;
		modifyStats(
			minion,
			multiplier * minion.attack,
			multiplier * minion.health,
			input.playerBoard,
			input.playerEntity,
			input.gameState,
		);
		input.gameState.spectator.registerPowerTarget(
			minion,
			minion,
			input.playerBoard,
			input.playerEntity,
			input.opponentEntity,
		);
		return true;
	},
};
