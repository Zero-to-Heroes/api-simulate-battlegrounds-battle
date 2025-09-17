import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { doFullAttack, findNearestEnemies } from '../../../simulation/attack';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';

export const AudaciousAnchor = {
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const iterations = minion.cardId === CardIds.AudaciousAnchor_BG28_904_G ? 2 : 1;
		for (let i = 0; i < iterations; i++) {
			const targets = findNearestEnemies(
				input.playerBoard,
				minion,
				input.playerBoard.length - 1 - input.playerBoard.indexOf(minion),
				input.opponentBoard,
				1,
				input.gameState.allCards,
			);
			if (!targets.length) {
				break;
			}
			if (targets.length > 2) {
				console.error('Invalid number of targets', targets.length);
			}

			const target = pickRandom(targets);
			while (minion.health > 0 && target.health > 0 && !minion.definitelyDead && !target.definitelyDead) {
				// Attackers don't alternate
				// See http://replays.firestoneapp.com/?reviewId=f9f6bf62-db73-49ad-8187-d2f8848b7f36&turn=17&action=0
				doFullAttack(
					minion,
					input.playerBoard,
					input.playerEntity,
					target,
					input.opponentBoard,
					input.opponentEntity,
					input.gameState,
				);
			}
		}
		return true;
	},
};
