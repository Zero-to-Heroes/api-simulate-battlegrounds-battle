import { BoardSecret } from '../../../board-secret';
import { pickRandom } from '../../../services/utils';
import { findNearestEnemies } from '../../../simulation/attack';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { StartOfCombatCard } from '../../card.interface';

export const SharingIsCaring: StartOfCombatCard = {
	cardIds: [TempCardIds.SharingIsCaring],
	startOfCombat: (secret: BoardSecret, input: SoCInput) => {
		const friendlyMinion = input.playerBoard[0];
		if (!friendlyMinion) {
			return false;
		}

		const targets = findNearestEnemies(
			input.playerBoard,
			friendlyMinion,
			input.playerBoard.length - 1 - input.playerBoard.indexOf(friendlyMinion),
			input.opponentBoard,
			1,
			input.gameState.allCards,
		);
		if (!targets.length) {
			return false;
		}
		if (targets.length > 2) {
			console.error('Invalid number of targets', targets.length);
		}

		const target = pickRandom(targets);
		modifyStats(
			friendlyMinion,
			target.attack,
			target.health,
			input.playerBoard,
			input.playerEntity,
			input.gameState,
		);
		return true;
	},
};
