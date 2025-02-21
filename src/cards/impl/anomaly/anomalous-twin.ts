import { BoardTrinket } from '../../../bgs-player-entity';
import { BoardEntity } from '../../../board-entity';
import { spawnEntities } from '../../../simulation/deathrattle-spawns';
import { performEntitySpawns } from '../../../simulation/spawns';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';

export const AnomalousTwin = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		if (!!input.playerBoard.length && input.playerBoard.length < 7) {
			const highestHealthMinion = [...input.playerBoard].sort((a, b) => b.health - a.health)[0];
			const copy: BoardEntity = {
				...highestHealthMinion,
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
				highestHealthMinion.friendly,
				true,
				false,
				false,
				copy,
			);
			const indexFromRight = input.playerBoard.length - (input.playerBoard.indexOf(highestHealthMinion) + 1);
			const spawns = performEntitySpawns(
				newMinions,
				input.playerBoard,
				input.playerEntity,
				highestHealthMinion,
				indexFromRight,
				input.opponentBoard,
				input.opponentEntity,
				input.gameState,
			);
			if (spawns.length > 0) {
				input.gameState.spectator.registerPowerTarget(input.playerEntity, copy, input.playerBoard, null, null);
				// Recompute first attacker
				// See https://replays.firestoneapp.com/?reviewId=93229c4a-d864-4196-83dd-2fea2a5bf70a&turn=29&action=0
				return { hasTriggered: true, shouldRecomputeCurrentAttacker: true };
			}
		}
	},
};
