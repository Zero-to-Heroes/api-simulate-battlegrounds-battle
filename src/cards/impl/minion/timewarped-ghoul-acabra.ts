import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { TempCardIds } from '../../../temp-card-ids';
import { addStatsToBoard } from '../../../utils';
import { DeathrattleTriggeredCard } from '../../card.interface';

export const TimewarpedGhoulAcabra: DeathrattleTriggeredCard = {
	cardIds: [TempCardIds.TimewarpedGhoulAcabra, TempCardIds.TimewarpedGhoulAcabra_G],
	onDeathrattleTriggered: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedGhoulAcabra_G ? 2 : 1;
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
