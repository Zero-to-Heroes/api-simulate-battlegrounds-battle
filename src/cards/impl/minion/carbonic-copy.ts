import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { spawnEntities } from '../../../simulation/deathrattle-spawns';
import { performEntitySpawns } from '../../../simulation/spawns';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';

export const CarbonicCopy = {
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		let totalSpawned = 0;
		const numberOfCopies = minion.cardId === CardIds.CarbonicCopy_BG27_503_G ? 2 : 1;
		for (let i = 0; i < numberOfCopies; i++) {
			if (!!input.playerBoard.length && input.playerBoard.length < 7) {
				const copy: BoardEntity = {
					...minion,
					lastAffectedByEntity: null,
				};
				const newMinions = spawnEntities(
					copy.cardId,
					1,
					input.playerBoard,
					input.playerEntity,
					input.opponentBoard,
					input.opponentEntity,
					input.gameState,
					minion.friendly,
					true,
					false,
					false,
					copy,
				);
				const indexFromRight = input.playerBoard.length - (input.playerBoard.indexOf(minion) + 1);
				const actualSpawns = performEntitySpawns(
					newMinions,
					input.playerBoard,
					input.playerEntity,
					minion,
					indexFromRight,
					input.opponentBoard,
					input.opponentEntity,
					input.gameState,
				);
				totalSpawned += actualSpawns.length;
				input.gameState.spectator.registerPowerTarget(
					minion,
					copy,
					input.playerBoard,
					input.playerEntity,
					input.opponentEntity,
				);
			}
		}
		return true;
	},
};
