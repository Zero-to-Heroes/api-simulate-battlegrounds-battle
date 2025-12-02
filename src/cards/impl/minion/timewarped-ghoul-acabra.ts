import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { addStatsToBoard } from '../../../utils';
import { DeathrattleTriggeredCard } from '../../card.interface';

export const TimewarpedGhoulAcabra: DeathrattleTriggeredCard = {
	cardIds: [CardIds.TimewarpedGhoulAcabra_BG34_Giant_609, CardIds.TimewarpedGhoulAcabra_BG34_Giant_609_G],
	onDeathrattleTriggered: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.TimewarpedGhoulAcabra_BG34_Giant_609_G ? 2 : 1;
		addStatsToBoard(
			minion,
			input.boardWithDeadEntity,
			input.boardWithDeadEntityHero,
			2 * mult,
			2 * mult,
			input.gameState,
		);
	},
};
