import { BoardTrinket } from '../../../bgs-player-entity';
import { updateDivineShield } from '../../../keywords/divine-shield';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { TempCardIds } from '../../../temp-card-ids';
import { StartOfCombatCard } from '../../card.interface';

export const StandAsOne: StartOfCombatCard = {
	cardIds: [TempCardIds.StandAsOne],
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		if (input.playerBoard.length > 0) {
			const target = input.playerBoard[0];
			if (!!target) {
				updateDivineShield(
					target,
					input.playerBoard,
					input.playerEntity,
					input.opponentEntity,
					true,
					input.gameState,
				);
				target.attackImmediately = true;
			}
			return true;
		}
	},
};
