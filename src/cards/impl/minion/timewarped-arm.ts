import { BoardEntity } from '../../../board-entity';
import { OnMinionAttackedInput } from '../../../simulation/on-being-attacked';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { OnMinionAttackedCard } from '../../card.interface';

export const TimewarpedArm: OnMinionAttackedCard = {
	cardIds: [TempCardIds.TimewarpedArm, TempCardIds.TimewarpedArm_G],
	onAttacked: (minion: BoardEntity, input: OnMinionAttackedInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedArm_G ? 2 : 1;
		modifyStats(
			input.defendingEntity,
			minion,
			8 * mult,
			0,
			input.defendingBoard,
			input.defendingHero,
			input.gameState,
		);
	},
};
