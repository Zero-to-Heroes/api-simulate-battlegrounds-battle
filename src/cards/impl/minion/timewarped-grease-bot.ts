import { BoardEntity } from '../../../board-entity';
import { OnDivineShieldUpdatedInput } from '../../../keywords/divine-shield';
import { CardIds } from '../../../services/card-ids';
import { addStatsToBoard } from '../../../utils';
import { OnDivineShieldUpdatedCard } from '../../card.interface';

export const TimewarpedGreaseBot: OnDivineShieldUpdatedCard = {
	cardIds: [CardIds.TimewarpedGreaseBot_BG34_Giant_656, CardIds.TimewarpedGreaseBot_BG34_Giant_656_G],
	onDivineShieldUpdated: (minion: BoardEntity, input: OnDivineShieldUpdatedInput) => {
		const mult = minion.cardId === CardIds.TimewarpedGreaseBot_BG34_Giant_656_G ? 2 : 1;
		addStatsToBoard(input.target, input.board, input.hero, 2 * mult, 2 * mult, input.gameState);
	},
};
