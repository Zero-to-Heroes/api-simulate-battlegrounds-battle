import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { modifyStats } from '../../../simulation/stats';
import { OnBattlecryTriggeredCard } from '../../card.interface';

export const BlazingSkyfin: OnBattlecryTriggeredCard = {
	cardIds: [CardIds.BlazingSkyfin_BG25_040, CardIds.BlazingSkyfin_BG25_040_G],
	onBattlecryTriggered: (minion: BoardEntity, input: BattlecryInput) => {
		const buff = minion.cardId === CardIds.BlazingSkyfin_BG25_040 ? 1 : 2;
		modifyStats(minion, minion, buff, buff, input.board, input.hero, input.gameState);
	},
};
