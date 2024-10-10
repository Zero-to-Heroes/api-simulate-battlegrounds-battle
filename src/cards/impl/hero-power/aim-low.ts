import { BoardTrinket } from '../../../bgs-player-entity';
import { pickRandom } from '../../../services/utils';
import { dealDamageToMinion } from '../../../simulation/attack';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';

export const AimLow = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		if (input.playerEntity.heroPowerUsed) {
			const smallestHealthMinion = [...input.opponentBoard].sort((a, b) => a.health - b.health)[0];
			const target = pickRandom(input.opponentBoard.filter((e) => e.health === smallestHealthMinion.health));
			const damageDone = dealDamageToMinion(
				target,
				input.opponentBoard,
				input.opponentEntity,
				null,
				input.playerEntity.heroPowerInfo2 ?? 0,
				input.playerBoard,
				input.playerEntity,
				input.gameState,
			);
			// processMinionDeath(playerBoard, playerEntity, opponentBoard, opponentEntity, allCards, cardsData, sharedState, spectator);
			input.playerEntity.deadEyeDamageDone = damageDone;
			return true;
		}
	},
};
