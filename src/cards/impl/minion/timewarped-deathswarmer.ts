import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addStatsToBoard } from '../../../utils';
import { OnDamagedCard, OnDamagedInput } from '../../card.interface';

export const TimewarpedDeathswarmer: OnDamagedCard = {
	cardIds: [CardIds.TimewarpedDeathswarmer_BG34_Giant_081, CardIds.TimewarpedDeathswarmer_BG34_Giant_081_G],
	onDamaged: (minion: BoardEntity, input: OnDamagedInput) => {
		const mult = minion.cardId === CardIds.TimewarpedDeathswarmer_BG34_Giant_081_G ? 2 : 1;
		input.hero.globalInfo.UndeadAttackBonus = (input.hero.globalInfo?.UndeadAttackBonus ?? 0) + 1 * mult;
		addStatsToBoard(minion, input.board, input.hero, 1 * mult, 0, input.gameState, Race[Race.UNDEAD], false);
	},
};
