import { BoardTrinket } from '../../../bgs-player-entity';
import { dealDamageToMinion } from '../../../simulation/attack';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';

export const AimRight = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		if (input.playerEntity.heroPowerUsed) {
			const target = input.opponentBoard[input.opponentBoard.length - 1];
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
