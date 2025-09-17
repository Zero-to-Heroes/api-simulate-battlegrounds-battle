import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { addStatsToBoard } from '../../../utils';
import { DeathrattleSpawnCard } from '../../card.interface';

export const ShipMasterEudora: DeathrattleSpawnCard = {
	cardIds: [CardIds.ShipMasterEudora_BG33_828, CardIds.ShipMasterEudora_BG33_828_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === CardIds.ShipMasterEudora_BG33_828_G ? 2 : 1;
		addStatsToBoard(
			minion,
			input.boardWithDeadEntity,
			input.boardWithDeadEntityHero,
			8 * mult,
			8 * mult,
			input.gameState,
		);
		return [];
	},
};
