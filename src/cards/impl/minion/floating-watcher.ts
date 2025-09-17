import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { AfterHeroDamagedInput } from '../../../simulation/damage-to-hero';
import { modifyStats } from '../../../simulation/stats';
import { AfterHeroDamagedCard } from '../../card.interface';

export const FloatingWatcher: AfterHeroDamagedCard = {
	cardIds: [CardIds.FloatingWatcher_BG_GVG_100, CardIds.FloatingWatcher_TB_BaconUps_101],
	afterHeroDamaged: (minion: BoardEntity, input: AfterHeroDamagedInput) => {
		const mult = minion.cardId === CardIds.FloatingWatcher_BG_GVG_100 ? 1 : 2;
		modifyStats(minion, minion, 2 * mult, 2 * mult, input.board, input.hero, input.gameState, false);
	},
};
