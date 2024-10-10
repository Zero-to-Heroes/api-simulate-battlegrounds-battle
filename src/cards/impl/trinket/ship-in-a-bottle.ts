import { BoardTrinket } from '../../../bgs-player-entity';
import { pickRandom } from '../../../services/utils';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { spawnEntities } from '../../../simulation/deathrattle-spawns';
import { performEntitySpawns } from '../../../simulation/spawns';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';

export const ShipInABottle = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		if (input.playerBoard.length < 7) {
			const target = pickRandom(input.gameState.cardsData.pirateSpawns);
			addCardsInHand(input.playerEntity, input.playerBoard, [target], input.gameState);
			const newMinions = spawnEntities(
				target,
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
			);
			const spawns = performEntitySpawns(
				newMinions,
				input.playerBoard,
				input.playerEntity,
				input.playerEntity,
				0,
				input.opponentBoard,
				input.opponentEntity,
				input.gameState,
			);
			spawns.forEach((spawn) => (spawn.attackImmediately = true));
			return true;
		}
	},
};
