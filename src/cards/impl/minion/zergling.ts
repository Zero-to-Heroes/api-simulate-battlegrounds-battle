import { BoardEntity } from '../../../board-entity';
import { removeAurasFromSelf } from '../../../simulation/add-minion-to-board';
import { spawnEntities } from '../../../simulation/deathrattle-spawns';
import { performEntitySpawns } from '../../../simulation/spawns';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { TempCardIds } from '../../../temp-card-ids';
import { copyEntity } from '../../../utils';
import { StartOfCombatCard } from '../../card.interface';

export const Zergling: StartOfCombatCard = {
	cardIds: [TempCardIds.Zergling, TempCardIds.Zergling_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		let hasTriggered = false;
		if (input.playerBoard.length < 7) {
			const copy = copyEntity(minion);
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
			const indexFromRight = input.playerBoard.length - input.playerBoard.indexOf(minion) - 1;
			const spawns = performEntitySpawns(
				newMinions,
				input.playerBoard,
				input.playerEntity,
				input.playerEntity,
				indexFromRight,
				input.opponentBoard,
				input.opponentEntity,
				input.gameState,
			);
			hasTriggered = true;
		}
		return { hasTriggered: hasTriggered, shouldRecomputeCurrentAttacker: hasTriggered };
	},
};
