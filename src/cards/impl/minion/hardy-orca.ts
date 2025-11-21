import { BoardEntity } from '../../../board-entity';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { OnDamagedCard, OnDamagedInput } from '../../card.interface';

export const HardyOrca: OnDamagedCard = {
	cardIds: [TempCardIds.HardyOrca, TempCardIds.HardyOrca_G],
	onDamaged: (minion: BoardEntity, input: OnDamagedInput) => {
		const mult = minion.cardId === TempCardIds.HardyOrca_G ? 2 : 1;
		const targets = input.board.filter((e) => e !== minion);
		for (const target of targets) {
			modifyStats(target, minion, 1 * mult, 1 * mult, input.board, input.hero, input.gameState);
		}
	},
};
