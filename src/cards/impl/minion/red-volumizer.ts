import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnBeforeMagnetizeInput } from '../../../simulation/magnetize';
import { modifyStats } from '../../../simulation/stats';
import { isVolumizer } from '../../../utils';
import { OnBeforeMagnetizeCard } from '../../card.interface';

export const RedVolumizer: OnBeforeMagnetizeCard = {
	cardIds: [CardIds.AutoAccelerator_RedVolumizerToken_BG34_170t, CardIds.RedVolumizer_BG34_170t_G],
	onBeforeMagnetize: (entity: BoardEntity, input: OnBeforeMagnetizeInput) => {
		const mult = entity.cardId === CardIds.RedVolumizer_BG34_170t_G ? 2 : 1;
		const buff = 3 * mult;
		input.hero.globalInfo.VolumizerAttackBuff += buff;
		const targets = input.board.filter((e) =>
			isVolumizer(e.cardId, input.hero, input.gameState.anomalies, input.gameState.allCards),
		);
		for (const target of targets) {
			modifyStats(target, entity, buff, 0, input.board, input.hero, input.gameState);
		}
	},
};
