import { BoardTrinket } from '../../../bgs-player-entity';
import { dealDamageToMinion } from '../../../simulation/attack';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { StartOfCombatCard } from '../../card.interface';

export const AimLeft: StartOfCombatCard = {
	startOfCombatTiming: 'start-of-combat',
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		if (input.playerEntity.heroPowerUsed) {
			const target = input.opponentBoard[0];
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
			input.playerEntity.deadEyeDamageDone = damageDone;
			return true;
		}
	},
};
