import { BoardEntity } from '../../../board-entity';
import { updateVolumizerBuffs } from '../../../mechanics/player-global-effects';
import { CardIds } from '../../../services/card-ids';
import { OnBeforeMagnetizeSelfInput } from '../../../simulation/magnetize';
import { modifyStats } from '../../../simulation/stats';
import { OnBeforeMagnetizeSelfCard } from '../../card.interface';

export const BlueVolumizer: OnBeforeMagnetizeSelfCard = {
	cardIds: [CardIds.AutoAccelerator_BlueVolumizerToken_BG34_170t2, CardIds.BlueVolumizer_BG34_170t2_G],
	onBeforeMagnetizeSelf: (entity: BoardEntity, input: OnBeforeMagnetizeSelfInput) => {
		const mult = entity.cardId === CardIds.BlueVolumizer_BG34_170t2_G ? 2 : 1;
		const buff = 3 * mult;
		updateVolumizerBuffs(input.hero, input.board, 0, buff, input.gameState);
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
