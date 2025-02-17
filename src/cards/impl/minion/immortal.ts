import { BoardEntity } from '../../../board-entity';
import { getNeighbours } from '../../../simulation/attack';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { StartOfCombatCard } from '../../card.interface';

export const Immortal: StartOfCombatCard = {
	cardIds: [TempCardIds.Immortal, TempCardIds.Immortal_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const multiplier = minion.cardId === TempCardIds.Immortal_G ? 2 : 1;
		const neighbours = getNeighbours(input.playerBoard, minion);
		const neighboursAttack = neighbours.map((entity) => entity.attack).reduce((a, b) => a + b, 0);
		const neighboursHealth = neighbours.map((entity) => entity.health).reduce((a, b) => a + b, 0);
		modifyStats(
			minion,
			multiplier * neighboursAttack,
			multiplier * neighboursHealth,
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
