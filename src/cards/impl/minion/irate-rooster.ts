import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { dealDamageToMinion, getNeighbours } from '../../../simulation/attack';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';

export const IrateRooster = {
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const loops = minion.cardId === CardIds.IrateRooster_BG29_990_G ? 2 : 1;
		for (let i = 0; i < loops; i++) {
			const neighbours = getNeighbours(input.playerBoard, minion);
			for (const neighbour of neighbours) {
				input.gameState.spectator.registerPowerTarget(
					minion,
					neighbour,
					input.playerBoard,
					input.playerEntity,
					input.opponentEntity,
				);
				dealDamageToMinion(
					neighbour,
					input.playerBoard,
					input.playerEntity,
					minion,
					1,
					input.opponentBoard,
					input.opponentEntity,
					input.gameState,
				);
				modifyStats(neighbour, minion, 4, 0, input.playerBoard, input.playerEntity, input.gameState);
			}
		}
		return true;
	},
};
