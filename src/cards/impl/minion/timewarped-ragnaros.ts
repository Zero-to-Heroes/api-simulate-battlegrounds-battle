import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { dealDamageToMinion } from '../../../simulation/attack';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { TempCardIds } from '../../../temp-card-ids';
import { StartOfCombatCard } from '../../card.interface';

export const TimewarpedRagnaros: StartOfCombatCard = {
	cardIds: [TempCardIds.TimewarpedRagnaros, TempCardIds.TimewarpedRagnaros_G],
	startOfCombatTiming: 'start-of-combat',
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedRagnaros_G ? 2 : 1;
		const target = pickRandom(input.opponentBoard);
		if (!!target) {
			dealDamageToMinion(
				target,
				input.opponentBoard,
				input.opponentEntity,
				input.playerEntity,
				8 * mult,
				input.playerBoard,
				input.playerEntity,
				input.gameState,
			);
		}
		return { hasTriggered: true, shouldRecomputeCurrentAttacker: true };
	},
};
