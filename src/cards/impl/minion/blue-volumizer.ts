import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnBeforeMagnetizeInput } from '../../../simulation/magnetize';
import { modifyStats } from '../../../simulation/stats';
import { isVolumizer } from '../../../utils';
import { OnBeforeMagnetizeCard } from '../../card.interface';

export const BlueVolumizer: OnBeforeMagnetizeCard = {
	cardIds: [CardIds.AutoAccelerator_BlueVolumizerToken_BG34_170t2, CardIds.BlueVolumizer_BG34_170t2_G],
	onBeforeMagnetize: (entity: BoardEntity, input: OnBeforeMagnetizeInput) => {
		const mult = entity.cardId === CardIds.BlueVolumizer_BG34_170t2_G ? 2 : 1;
		const buff = 3 * mult;
		input.hero.globalInfo.VolumizerHealthBuff += buff;
		const targets = input.board.filter((e) =>
			isVolumizer(e.cardId, input.hero, input.gameState.anomalies, input.gameState.allCards),
		);
		for (const target of targets) {
			modifyStats(target, entity, 0, buff, input.board, input.hero, input.gameState);
		}
	},
};
