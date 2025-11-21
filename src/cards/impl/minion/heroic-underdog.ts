import { BoardEntity } from '../../../board-entity';
import { OnAttackInput } from '../../../simulation/on-attack';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { RallyCard } from '../../card.interface';

export const HeroicUnderdog: RallyCard = {
	cardIds: [TempCardIds.HeroicUnderdog, TempCardIds.HeroicUnderdog_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === TempCardIds.HeroicUnderdog_G ? 2 : 1;
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
