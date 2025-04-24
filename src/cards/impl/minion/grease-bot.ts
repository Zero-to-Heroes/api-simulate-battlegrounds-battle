import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnDivineShieldUpdatedInput } from '../../../keywords/divine-shield';
import { modifyStats } from '../../../simulation/stats';
import { OnDivineShieldUpdatedCard } from '../../card.interface';

export const GreaseBot: OnDivineShieldUpdatedCard = {
	cardIds: [CardIds.GreaseBot_BG21_024, CardIds.GreaseBot_BG21_024_G],
	onDivineShieldUpdated: (minion: BoardEntity, input: OnDivineShieldUpdatedInput) => {
		const mult = minion.cardId === CardIds.GreaseBot_BG21_024 ? 1 : 2;
		modifyStats(input.target, minion, 2 * mult, 1 * mult, input.board, input.hero, input.gameState);
	},
};
