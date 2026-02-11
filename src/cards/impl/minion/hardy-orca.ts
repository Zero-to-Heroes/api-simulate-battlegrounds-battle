import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { modifyStats } from '../../../simulation/stats';
import { OnDamagedCard, OnDamagedInput } from '../../card.interface';

export const HardyOrca: OnDamagedCard = {
	cardIds: [CardIds.HardyOrca_BG34_312, CardIds.HardyOrca_BG34_312_G],
	// When multiple minions are damaged, the damage is first applied to all minions, then
	// the buff occurs
	// https://replays.firestoneapp.com/?reviewId=c3c7c2b0-1f61-4fac-a7fc-eda57ce8e16f&turn=13&action=3
	onDamaged: (minion: BoardEntity, input: OnDamagedInput) => {
		const mult = minion.cardId === CardIds.HardyOrca_BG34_312_G ? 2 : 1;
		const targets = input.board.filter((e) => e !== minion && e.health > 0 && !e.definitelyDead);
		for (const target of targets) {
			modifyStats(target, minion, 1 * mult, 1 * mult, input.board, input.hero, input.gameState);
		}
	},
};
