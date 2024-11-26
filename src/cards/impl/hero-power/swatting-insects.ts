import { BoardTrinket } from '../../../bgs-player-entity';
import { updateDivineShield } from '../../../keywords/divine-shield';
import { updateTaunt } from '../../../keywords/taunt';
import { updateWindfury } from '../../../keywords/windfury';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { StartOfCombatCard } from '../../card.interface';

export const SwattingInsects: StartOfCombatCard = {
	startOfCombatTiming: 'pre-combat',
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		if (input.playerBoard.length > 0) {
			const firstEntity = input.playerBoard[0];
			if (!firstEntity.windfury || !firstEntity.divineShield || !firstEntity.taunt) {
				updateWindfury(
					firstEntity,
					true,
					input.playerBoard,
					input.playerEntity,
					input.opponentEntity,
					input.gameState,
				);
				updateTaunt(
					firstEntity,
					true,
					input.playerBoard,
					input.playerEntity,
					input.opponentEntity,
					input.gameState,
				);
				if (!firstEntity.divineShield) {
					updateDivineShield(
						firstEntity,
						input.playerBoard,
						input.playerEntity,
						input.opponentEntity,
						true,
						input.gameState,
					);
				}
				input.gameState.spectator.registerPowerTarget(
					firstEntity,
					firstEntity,
					input.playerBoard,
					input.playerEntity,
					input.opponentEntity,
				);
				return true;
			}
		}
	},
};
