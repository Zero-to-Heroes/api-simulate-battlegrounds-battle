import { CardIds } from '@firestone-hs/reference-data';
import { BoardTrinket } from '../../../bgs-player-entity';
import { pickRandom } from '../../../services/utils';
import { dealDamageToMinion } from '../../../simulation/attack';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { StartOfCombatCard } from '../../card.interface';

export const AimHigh: StartOfCombatCard = {
	startOfCombatTiming: 'start-of-combat',
	cardIds: [CardIds.AimHighToken],
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		for (const heroPower of input.playerEntity.heroPowers) {
			if (AimHigh.cardIds.includes(heroPower.cardId) && heroPower.used) {
				const highestHealthMinion = [...input.opponentBoard].sort((a, b) => b.health - a.health)[0];
				const target = pickRandom(input.opponentBoard.filter((e) => e.health === highestHealthMinion.health));
				const damageDone = dealDamageToMinion(
					target,
					input.opponentBoard,
					input.opponentEntity,
					input.playerEntity,
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
