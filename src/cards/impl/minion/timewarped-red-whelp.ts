import { BoardEntity } from '../../../board-entity';
import { dealDamageToRandomEnemy } from '../../../simulation/attack';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { TempCardIds } from '../../../temp-card-ids';
import { StartOfCombatCard } from '../../card.interface';

export const TimewarpedRedWhelp: StartOfCombatCard = {
	cardIds: [TempCardIds.TimewarpedRedWhelp, TempCardIds.TimewarpedRedWhelp_G],
	startOfCombatTiming: 'start-of-combat',
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedRedWhelp_G ? 2 : 1;
		const damage = minion.scriptDataNum1 ?? 2;
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
