import { BoardEntity } from '../../../board-entity';
import { OnBeforeMagnetizeInput } from '../../../simulation/magnetize';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { isVolumizer } from '../../../utils';
import { OnBeforeMagnetizeCard } from '../../card.interface';

export const RedVolumizer: OnBeforeMagnetizeCard = {
	cardIds: [TempCardIds.RedVolumizer, TempCardIds.RedVolumizer_G],
	onBeforeMagnetize: (entity: BoardEntity, input: OnBeforeMagnetizeInput) => {
		const mult = entity.cardId === TempCardIds.RedVolumizer_G ? 2 : 1;
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
