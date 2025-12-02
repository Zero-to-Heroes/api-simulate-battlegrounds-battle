import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { RallyCard } from '../../card.interface';

export const HeroicUnderdog: RallyCard = {
	cardIds: [CardIds.HeroicUnderdog_BG34_604, CardIds.HeroicUnderdog_BG34_604_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		if (!input.defendingEntity) {
			return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
		}
		const mult = minion.cardId === CardIds.HeroicUnderdog_BG34_604_G ? 2 : 1;
		const target = input.defendingEntity;
		modifyStats(
			minion,
			minion,
			target.attack * mult,
			0,
			input.attackingBoard,
			input.attackingHero,
			input.gameState,
		);
		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
