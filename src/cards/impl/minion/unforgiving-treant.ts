import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { modifyStats } from '../../../simulation/stats';
import { OnDamagedCard, OnDamagedInput } from '../../card.interface';

export const UnforgivingTreant: OnDamagedCard = {
	cardIds: [CardIds.UnforgivingTreant_BG29_846, CardIds.UnforgivingTreant_BG29_846_G],
	onDamaged: (minion: BoardEntity, input: OnDamagedInput) => {
		const mult = minion.cardId === CardIds.UnforgivingTreant_BG29_846_G ? 2 : 1;
		for (const target of input.board) {
			modifyStats(target, minion, 2 * mult, 0, input.board, input.hero, input.gameState);
		}
	},
};
