import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { TempCardIds } from '../../../temp-card-ids';
import { addStatsToBoard } from '../../../utils';
import { OnDamagedCard, OnDamagedInput } from '../../card.interface';

export const TimewarpedDeathswarmer: OnDamagedCard = {
	cardIds: [TempCardIds.TimewarpedDeathswarmer, TempCardIds.TimewarpedDeathswarmer_G],
	onDamaged: (minion: BoardEntity, input: OnDamagedInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedDeathswarmer_G ? 2 : 1;
		input.hero.globalInfo.UndeadAttackBonus = (input.hero.globalInfo?.UndeadAttackBonus ?? 0) + 1 * mult;
		addStatsToBoard(minion, input.board, input.hero, 1 * mult, 0, input.gameState, Race[Race.UNDEAD], false);
	},
};
