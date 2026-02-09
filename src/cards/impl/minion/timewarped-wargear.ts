import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnAfterMagnetizeSelfInput } from '../../../simulation/magnetize';
import { modifyStats } from '../../../simulation/stats';
import { OnAfterMagnetizeSelfCard } from '../../card.interface';

export const TimewarpedWargear: OnAfterMagnetizeSelfCard = {
	cardIds: [CardIds.TimewarpedWargear_BG34_Giant_677, CardIds.TimewarpedWargear_BG34_Giant_677_G],
	onAfterMagnetizeSelf: (minion: BoardEntity, input: OnAfterMagnetizeSelfInput) => {
		const mult = minion.cardId === CardIds.TimewarpedWargear_BG34_Giant_677_G ? 2 : 1;
		// Never sure whether to use setEntityStats or modifyStats here (ie aura reapply or not)
		modifyStats(
			input.magnetizeTarget,
			minion,
			input.magnetizeTarget.attack * mult,
			input.magnetizeTarget.health * mult,
			input.board,
			input.hero,
			input.gameState,
		);
	},
};
