import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnAttackInput } from '../../../simulation/on-attack';
import { grantStatsToMinionsOfEachType } from '../../../utils';
import { RallyCard } from '../../card.interface';

export const TheLastOneStanding: RallyCard = {
	cardIds: [CardIds.TheLastOneStanding_BG34_320, CardIds.TheLastOneStanding_BG34_320_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === CardIds.TheLastOneStanding_BG34_320_G ? 2 : 1;
		grantStatsToMinionsOfEachType(
			minion,
			input.attackingBoard,
			input.attackingHero,
			12 * mult,
			12 * mult,
			input.gameState,
		);
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
