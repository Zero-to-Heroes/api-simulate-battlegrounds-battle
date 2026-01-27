import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { dealDamageToRandomEnemy } from '../../../simulation/attack';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { StartOfCombatCard } from '../../card.interface';

export const TimewarpedRedWhelp: StartOfCombatCard = {
	cardIds: [CardIds.TimewarpedRedWhelp_BG34_Giant_091, CardIds.TimewarpedRedWhelp_BG34_Giant_091_G],
	startOfCombatTiming: 'start-of-combat',
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const mult = minion.cardId === CardIds.TimewarpedRedWhelp_BG34_Giant_091_G ? 2 : 1;
		const damage = minion.scriptDataNum1 ?? 3;
		const loops = 2 * mult;
		for (let i = 0; i < loops; i++) {
			dealDamageToRandomEnemy(
				input.opponentBoard,
				input.opponentEntity,
				minion,
				damage,
				input.playerBoard,
				input.playerEntity,
				input.gameState,
			);
		}
		return true;
	},
};
