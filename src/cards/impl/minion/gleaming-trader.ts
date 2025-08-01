import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnDivineShieldUpdatedInput } from '../../../keywords/divine-shield';
import { addStatsToBoard } from '../../../utils';
import { OnDivineShieldUpdatedCard } from '../../card.interface';

export const GleamingTrader: OnDivineShieldUpdatedCard = {
	cardIds: [CardIds.GleamingTrader_BG33_805, CardIds.GleamingTrader_BG33_805_G],
	onDivineShieldUpdated: (minion: BoardEntity, input: OnDivineShieldUpdatedInput) => {
		const mult = minion.cardId === CardIds.GleamingTrader_BG33_805_G ? 2 : 1;
		input.hero.globalInfo.AdditionalAttack += 2 * mult;
		addStatsToBoard(minion, input.board, input.hero, 2 * mult, 0, input.gameState);
	},
};
