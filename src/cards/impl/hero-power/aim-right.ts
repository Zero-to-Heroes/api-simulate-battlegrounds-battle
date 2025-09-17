import { CardIds } from '../../../services/card-ids';
import { BoardTrinket } from '../../../bgs-player-entity';
import { dealDamageToMinion } from '../../../simulation/attack';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { StartOfCombatCard } from '../../card.interface';

export const AimRight: StartOfCombatCard = {
	startOfCombatTiming: 'start-of-combat',
	cardIds: [CardIds.AimRightToken],
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		for (const heroPower of input.playerEntity.heroPowers) {
			if (AimRight.cardIds.includes(heroPower.cardId) && heroPower.used) {
				const target = input.opponentBoard[input.opponentBoard.length - 1];
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
				input.playerEntity.deadEyeDamageDone = damageDone;
				return true;
			}
		}
	},
};
