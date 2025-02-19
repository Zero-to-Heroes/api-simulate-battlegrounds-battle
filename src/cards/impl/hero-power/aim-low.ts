import { BoardTrinket } from '../../../bgs-player-entity';
import { pickRandom } from '../../../services/utils';
import { dealDamageToMinion } from '../../../simulation/attack';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { StartOfCombatCard } from '../../card.interface';

export const AimLow: StartOfCombatCard = {
	startOfCombatTiming: 'start-of-combat',
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		for (const heroPower of input.playerEntity.heroPowers) {
			if (heroPower.used) {
				const smallestHealthMinion = [...input.opponentBoard].sort((a, b) => a.health - b.health)[0];
				const target = pickRandom(input.opponentBoard.filter((e) => e.health === smallestHealthMinion.health));
				const damageDone = dealDamageToMinion(
					target,
					input.opponentBoard,
					input.opponentEntity,
					null,
					heroPower.info2 ?? 0,
					input.playerBoard,
					input.playerEntity,
					input.gameState,
				);
				// processMinionDeath(playerBoard, playerEntity, opponentBoard, opponentEntity, allCards, cardsData, sharedState, spectator);
				input.playerEntity.deadEyeDamageDone = damageDone;
				return true;
			}
		}
	},
};
