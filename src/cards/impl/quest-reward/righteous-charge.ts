import { CardIds } from '../../../services/card-ids';
import { BoardTrinket } from '../../../bgs-player-entity';
import { updateDivineShield } from '../../../keywords/divine-shield';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { StartOfCombatCard } from '../../card.interface';
import { simulateAttack } from '../../../simulation/attack';

export const RighteousCharge: StartOfCombatCard = {
	cardIds: [CardIds.RighteousCharge_BG33_Reward_003],
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		if (input.playerBoard.length > 0) {
			const target = input.playerBoard[0];
			if (!!target) {
				input.gameState.spectator.registerPowerTarget(
					trinket,
					target,
					input.playerBoard,
					input.playerEntity,
					input.opponentEntity,
				);
				updateDivineShield(
					target,
					input.playerBoard,
					input.playerEntity,
					input.opponentEntity,
					true,
					input.gameState,
				);
				target.attackImmediately = true;
				const previousHasAttacked = target.hasAttacked;
				simulateAttack(
					input.playerBoard,
					input.playerEntity,
					input.opponentBoard,
					input.opponentEntity,
					input.gameState,
				);
				target.hasAttacked = previousHasAttacked;
				target.attackImmediately = false;
			}
			return true;
		}
	},
};
