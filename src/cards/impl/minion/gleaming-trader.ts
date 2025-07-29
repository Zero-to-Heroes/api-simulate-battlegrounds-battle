import { BoardEntity } from '../../../board-entity';
import { OnDivineShieldUpdatedInput } from '../../../keywords/divine-shield';
import { TempCardIds } from '../../../temp-card-ids';
import { addStatsToBoard } from '../../../utils';
import { OnDivineShieldUpdatedCard } from '../../card.interface';

export const GleamingTrader: OnDivineShieldUpdatedCard = {
	cardIds: [TempCardIds.GleamingTrader, TempCardIds.GleamingTrader_G],
	onDivineShieldUpdated: (minion: BoardEntity, input: OnDivineShieldUpdatedInput) => {
		const mult = minion.cardId === TempCardIds.GleamingTrader_G ? 2 : 1;
		input.hero.globalInfo.AdditionalAttack += 2 * mult;
		addStatsToBoard(minion, input.board, input.hero, 2 * mult, 0, input.gameState);
	},
};
