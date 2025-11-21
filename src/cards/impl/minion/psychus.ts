import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { StartOfCombatCard } from '../../card.interface';

export const Psychus: StartOfCombatCard = {
	cardIds: [TempCardIds.Psychus, TempCardIds.Psychus_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const multiplier = minion.cardId === TempCardIds.Psychus_G ? 2 : 1;
		const attackToGain = Math.max(...[...input.playerBoard, ...input.opponentBoard].map((e) => e.attack));
		const healthToGain = Math.max(...[...input.playerBoard, ...input.opponentBoard].map((e) => e.health));
		modifyStats(
			minion,
			minion,
			attackToGain * multiplier,
			healthToGain * multiplier,
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
