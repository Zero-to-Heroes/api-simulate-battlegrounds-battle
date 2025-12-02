import { BoardEntity } from '../../../board-entity';
import { updateVolumizerBuffs } from '../../../mechanics/player-global-effects';
import { CardIds } from '../../../services/card-ids';
import { OnBeforeMagnetizeSelfInput } from '../../../simulation/magnetize';
import { modifyStats } from '../../../simulation/stats';
import { OnBeforeMagnetizeSelfCard } from '../../card.interface';

export const GreenVolumizer: OnBeforeMagnetizeSelfCard = {
	cardIds: [CardIds.AutoAccelerator_GreenVolumizerToken_BG34_170t3, CardIds.GreenVolumizer_BG34_170t3_G],
	onBeforeMagnetizeSelf: (entity: BoardEntity, input: OnBeforeMagnetizeSelfInput) => {
		const mult = entity.cardId === CardIds.GreenVolumizer_BG34_170t3_G ? 2 : 1;
		const buff = 1 * mult;
		updateVolumizerBuffs(input.hero, input.board, buff, buff, input.gameState);
		modifyStats(
			entity,
			entity,
			input.hero.globalInfo.VolumizerAttackBuff,
			input.hero.globalInfo.VolumizerHealthBuff,
			input.board,
			input.hero,
			input.gameState,
		);
	},
};
