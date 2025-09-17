import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { StartOfCombatCard } from '../../card.interface';

export const AllSeeingElder: StartOfCombatCard = {
	cardIds: [CardIds.AllSeeingElder_BG33_300, CardIds.AllSeeingElder_BG33_300_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const multiplier = minion.cardId === CardIds.AllSeeingElder_BG33_300_G ? 2 : 1;
		const attackToGain = input.playerBoard[0].attack;
		const healthToGain = input.playerBoard[input.playerBoard.length - 1].health;
		for (let i = 0; i < multiplier; i++) {
			modifyStats(
				minion,
				minion,
				attackToGain,
				healthToGain,
				input.playerBoard,
				input.playerEntity,
				input.gameState,
			);
			input.gameState.spectator.registerPowerTarget(
				minion,
				minion,
				input.playerBoard,
				input.playerEntity,
				input.opponentEntity,
			);
		}
		return true;
	},
};
