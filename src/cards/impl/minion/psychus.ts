import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats, setEntityStats } from '../../../simulation/stats';
import { StartOfCombatCard } from '../../card.interface';

export const Psychus: StartOfCombatCard = {
	cardIds: [CardIds.Psychus_BG34_318, CardIds.Psychus_BG34_318_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const multiplier = minion.cardId === CardIds.Psychus_BG34_318_G ? 2 : 1;
		const attackToGain = Math.max(...[...input.playerBoard, ...input.opponentBoard].map((e) => e.attack));
		const healthToGain = Math.max(...[...input.playerBoard, ...input.opponentBoard].map((e) => e.health));
		setEntityStats(
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
