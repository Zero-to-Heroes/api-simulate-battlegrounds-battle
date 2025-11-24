import { BoardEntity } from '../../../board-entity';
import { playBloodGemsOn } from '../../../simulation/blood-gems';
import { OnAttackInput } from '../../../simulation/on-attack';
import { TempCardIds } from '../../../temp-card-ids';
import { RallyCard } from '../../card.interface';

export const TimewarpedBonker: RallyCard = {
	cardIds: [TempCardIds.TimewarpedBonker, TempCardIds.TimewarpedBonker_G],
	rally: (minion: BoardEntity, input: OnAttackInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedBonker_G ? 2 : 1;
		for (const target of input.attackingBoard.filter((e) => e.entityId !== input.attacker.entityId)) {
			playBloodGemsOn(
				minion,
				target,
				2 * mult,
				input.attackingBoard,
				input.attackingHero,
				input.defendingBoard,
				input.defendingHero,
				input.gameState,
			);
		}

		return { dmgDoneByAttacker: 0, dmgDoneByDefender: 0 };
	},
};
