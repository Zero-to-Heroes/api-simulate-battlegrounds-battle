import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnMinionAttackedInput } from '../../../simulation/on-being-attacked';
import { modifyStats } from '../../../simulation/stats';
import { OnMinionAttackedCard } from '../../card.interface';

export const TimewarpedArm: OnMinionAttackedCard = {
	cardIds: [CardIds.TimewarpedArm_BG34_Giant_027, CardIds.TimewarpedArm_BG34_Giant_027_G],
	onAttacked: (minion: BoardEntity, input: OnMinionAttackedInput) => {
		const mult = minion.cardId === CardIds.TimewarpedArm_BG34_Giant_027_G ? 2 : 1;
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
