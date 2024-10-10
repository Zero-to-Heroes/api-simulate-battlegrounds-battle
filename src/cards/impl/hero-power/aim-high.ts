import { BoardTrinket } from '../../../bgs-player-entity';
import { pickRandom } from '../../../services/utils';
import { dealDamageToMinion } from '../../../simulation/attack';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { StartOfCombatCard } from '../../card.interface';

export const AimHigh: StartOfCombatCard = {
	startOfCombatTiming: 'start-of-combat',
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		if (input.playerEntity.heroPowerUsed) {
			const highestHealthMinion = [...input.opponentBoard].sort((a, b) => b.health - a.health)[0];
			const target = pickRandom(input.opponentBoard.filter((e) => e.health === highestHealthMinion.health));
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
