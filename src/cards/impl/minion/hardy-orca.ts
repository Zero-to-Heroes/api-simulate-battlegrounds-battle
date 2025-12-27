import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { modifyStats } from '../../../simulation/stats';
import { OnDamagedCard, OnDamagedInput } from '../../card.interface';

export const HardyOrca: OnDamagedCard = {
	cardIds: [CardIds.HardyOrca_BG34_312, CardIds.HardyOrca_BG34_312_G],
	onDamaged: (minion: BoardEntity, input: OnDamagedInput) => {
		const mult = minion.cardId === CardIds.HardyOrca_BG34_312_G ? 2 : 1;
		const targets = input.board.filter((e) => e !== minion && e.health > 0 && !e.definitelyDead);
		for (const target of targets) {
			modifyStats(target, minion, 1 * mult, 1 * mult, input.board, input.hero, input.gameState);
		}
	},
};
