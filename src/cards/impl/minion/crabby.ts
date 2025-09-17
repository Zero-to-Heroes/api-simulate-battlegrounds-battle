import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { getNeighbours } from '../../../simulation/attack';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';

export const Crabby = {
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const neighbours = getNeighbours(input.playerBoard, minion);
		const multiplier = minion.cardId === CardIds.Crabby_BG22_HERO_000_Buddy_G ? 2 : 1;
		neighbours.forEach((entity) => {
			modifyStats(
				entity,
				minion,
				multiplier * (input.playerEntity.deadEyeDamageDone ?? 0),
				multiplier * (input.playerEntity.deadEyeDamageDone ?? 0),
				input.playerBoard,
				input.playerEntity,
				input.gameState,
			);
		});
		return true;
	},
};
