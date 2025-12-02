import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { dealDamageToMinion } from '../../../simulation/attack';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { StartOfCombatCard } from '../../card.interface';

export const TimewarpedRagnaros: StartOfCombatCard = {
	cardIds: [CardIds.TimewarpedRagnaros_BG34_Giant_580, CardIds.TimewarpedRagnaros_BG34_Giant_580_G],
	startOfCombatTiming: 'start-of-combat',
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const mult = minion.cardId === CardIds.TimewarpedRagnaros_BG34_Giant_580_G ? 2 : 1;
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
