import { BoardEntity } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { TempCardIds } from '../../../temp-card-ids';
import { grantStatsToMinionsOfEachType } from '../../../utils';
import { RallyCard } from '../../card.interface';

export const TheLastOneStanding: RallyCard = {
	cardIds: [TempCardIds.TheLastOneStanding, TempCardIds.TheLastOneStanding_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === TempCardIds.TheLastOneStanding_G ? 2 : 1;
		grantStatsToMinionsOfEachType(
			minion,
			input.attackingBoard,
			input.attackingHero,
			7 * mult,
			7 * mult,
			input.gameState,
		);
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
