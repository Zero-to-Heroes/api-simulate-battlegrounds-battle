import { BoardEntity } from '../../../board-entity';
import { updateVolumizerBuffs } from '../../../mechanics/player-global-effects';
import { CardIds } from '../../../services/card-ids';
import { OnBeforeMagnetizeInput } from '../../../simulation/magnetize';
import { modifyStats } from '../../../simulation/stats';
import { OnBeforeMagnetizeCard } from '../../card.interface';

export const RedVolumizer: OnBeforeMagnetizeCard = {
	cardIds: [CardIds.AutoAccelerator_RedVolumizerToken_BG34_170t, CardIds.RedVolumizer_BG34_170t_G],
	onBeforeMagnetize: (entity: BoardEntity, input: OnBeforeMagnetizeInput) => {
		const mult = entity.cardId === CardIds.RedVolumizer_BG34_170t_G ? 2 : 1;
		const buff = 3 * mult;
		updateVolumizerBuffs(input.hero, input.board, buff, 0, input.gameState);
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
