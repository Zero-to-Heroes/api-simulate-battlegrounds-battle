import { BoardTrinket } from '../../../bgs-player-entity';
import { updateDivineShield } from '../../../divine-shield';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { StartOfCombatCard } from '../../card.interface';

export const SwattingInsects: StartOfCombatCard = {
	startOfCombatTiming: 'pre-combat',
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		if (input.playerBoard.length > 0) {
			const firstEntity = input.playerBoard[0];
			if (!firstEntity.windfury || !firstEntity.divineShield || !firstEntity.taunt) {
				firstEntity.windfury = true;
				firstEntity.taunt = true;
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
