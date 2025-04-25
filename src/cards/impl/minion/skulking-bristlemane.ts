import { BoardEntity } from '../../../board-entity';
import { getNeighbours } from '../../../simulation/attack';
import { playBloodGemsOn } from '../../../simulation/blood-gems';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { TempCardIds } from '../../../temp-card-ids';
import { StartOfCombatCard } from '../../card.interface';

export const SkulkingBristlemane: StartOfCombatCard = {
	cardIds: [TempCardIds.SkulkingBristlemane, TempCardIds.SkulkingBristlemane_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const mult = minion.cardId === TempCardIds.SkulkingBristlemane_G ? 2 : 1;
		const neighbours = getNeighbours(input.playerBoard, minion);
		for (const neighbour of neighbours) {
			playBloodGemsOn(minion, neighbour, 1 * mult, input.playerBoard, input.playerEntity, input.gameState);
		}
		return { hasTriggered: true, shouldRecomputeCurrentAttacker: false };
	},
};
