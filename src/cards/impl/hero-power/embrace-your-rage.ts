import { BoardTrinket } from '../../../bgs-player-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { spawnEntities } from '../../../simulation/deathrattle-spawns';
import { performEntitySpawns } from '../../../simulation/spawns';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';

export const EmbraceYourRage = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		if (input.playerEntity.heroPowerUsed) {
			const createdCardId = input.playerEntity.heroPowerInfo as string;
			if (!createdCardId?.length) {
				return false;
			}

			const spawns = spawnEntities(
				createdCardId,
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
				true,
				false,
				false,
			);
			const indexFromRight = 0;
			const spawned = performEntitySpawns(
				spawns,
				input.playerBoard,
				input.playerEntity,
				input.playerEntity,
				indexFromRight,
				input.opponentBoard,
				input.opponentEntity,
				input.gameState,
			);
			if (spawned?.length) {
				input.gameState.spectator.registerPowerTarget(
					input.playerEntity,
					spawns[0],
					input.playerBoard,
					input.playerEntity,
					input.opponentEntity,
				);
				addCardsInHand(input.playerEntity, input.playerBoard, spawns, input.gameState);
				input.gameState.spectator.registerPowerTarget(
					input.playerEntity,
					spawns[0],
					input.playerBoard,
					input.playerEntity,
					input.opponentEntity,
				);
				return { hasTriggered: true, shouldRecomputeCurrentAttacker: true };
			}
		}
	},
};
