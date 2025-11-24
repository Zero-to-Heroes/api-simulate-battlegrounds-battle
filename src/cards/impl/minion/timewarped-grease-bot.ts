import { BoardEntity } from '../../../board-entity';
import { OnDivineShieldUpdatedInput } from '../../../keywords/divine-shield';
import { TempCardIds } from '../../../temp-card-ids';
import { addStatsToBoard } from '../../../utils';
import { OnDivineShieldUpdatedCard } from '../../card.interface';

export const TimewarpedGreaseBot: OnDivineShieldUpdatedCard = {
	cardIds: [TempCardIds.TimewarpedGreaseBot, TempCardIds.TimewarpedGreaseBot_G],
	onDivineShieldUpdated: (minion: BoardEntity, input: OnDivineShieldUpdatedInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedGreaseBot_G ? 2 : 1;
		addStatsToBoard(input.target, input.board, input.hero, 2 * mult, 2 * mult, input.gameState);
	},
};
