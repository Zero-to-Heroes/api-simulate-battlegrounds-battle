import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { OnBeforeMagnetizeInput } from '../../../simulation/magnetize';
import { modifyStats } from '../../../simulation/stats';
import { isVolumizer } from '../../../utils';
import { OnBeforeMagnetizeCard } from '../../card.interface';

export const GreenVolumizer: OnBeforeMagnetizeCard = {
	cardIds: [CardIds.AutoAccelerator_GreenVolumizerToken_BG34_170t3, CardIds.GreenVolumizer_BG34_170t3_G],
	onBeforeMagnetize: (entity: BoardEntity, input: OnBeforeMagnetizeInput) => {
		const mult = entity.cardId === CardIds.GreenVolumizer_BG34_170t3_G ? 2 : 1;
		const buff = 2 * mult;
		input.hero.globalInfo.VolumizerAttackBuff += buff;
		input.hero.globalInfo.VolumizerHealthBuff += buff;
		const targets = input.board.filter((e) =>
			isVolumizer(e.cardId, input.hero, input.gameState.anomalies, input.gameState.allCards),
		);
		for (const target of targets) {
			modifyStats(target, entity, buff, buff, input.board, input.hero, input.gameState);
		}
	},
};
