import { BoardTrinket } from '../../../bgs-player-entity';
import { BoardEntity } from '../../../board-entity';
import { removeAurasFromSelf } from '../../../simulation/add-minion-to-board';
import { spawnEntities } from '../../../simulation/deathrattle-spawns';
import { performEntitySpawns } from '../../../simulation/spawns';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { copyEntity } from '../../../utils';
import { StartOfCombatCard } from '../../card.interface';

export const KarazhanChessSet: StartOfCombatCard = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		let hasTriggered = false;
		if (input.playerBoard.length > 0) {
			let minionsToCopy = 1;
			for (let i = 0; i < Math.min(input.playerBoard.length, 7); i++) {
				if (minionsToCopy <= 0) {
					break;
				}
				const entityToCoy = input.playerBoard[i];
				const copy: BoardEntity = copyEntity(entityToCoy);
				removeAurasFromSelf(copy, input.playerBoard, input.playerEntity, input.gameState);
				const newMinions = spawnEntities(
					copy.cardId,
					1,
					input.playerBoard,
					input.playerEntity,
					input.opponentBoard,
					input.opponentEntity,
					input.gameState.allCards,
					input.gameState.cardsData,
					input.gameState.sharedState,
					input.gameState.spectator,
					input.playerEntity.friendly,
					false,
					false,
					false,
					copy,
				);
				const spawns = performEntitySpawns(
					newMinions,
					input.playerBoard,
					input.playerEntity,
					input.playerEntity,
					input.playerBoard.length - i - 1,
					input.opponentBoard,
					input.opponentEntity,
					input.gameState,
				);
				// TODO: according to http://replays.firestoneapp.com/?reviewId=576aa3bb-caa1-4e46-9d16-08a001fdd941&turn=23&action=3
				// it looks like the stats are simply copied from the original entity to the copy, instead
				// of summoning a copy and applying all the auras stuff
				// I've asked on Discord (2024-08-21) for clarification
				i += spawns.length;
				minionsToCopy--;
				hasTriggered = true;
			}
		}
		return { hasTriggered: hasTriggered, shouldRecomputeCurrentAttacker: hasTriggered };
	},
};
