import { BoardEntity } from '../../../board-entity';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { OnDamagedCard, OnDamagedInput } from '../../card.interface';

export const UnforgivingTreant: OnDamagedCard = {
	cardIds: [TempCardIds.UnforgivingTreant, TempCardIds.UnforgivingTreant_G],
	onDamaged: (minion: BoardEntity, input: OnDamagedInput) => {
		const mult = minion.cardId === TempCardIds.UnforgivingTreant_G ? 2 : 1;
		for (const target of input.board) {
			modifyStats(target, minion, 2 * mult, 0, input.board, input.hero, input.gameState);
		}
	},
};
