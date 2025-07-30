import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { TempCardIds } from '../../../temp-card-ids';
import { addStatsToBoard } from '../../../utils';
import { DeathrattleSpawnCard } from '../../card.interface';

export const ShipMasterEudora: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.ShipMasterEudora, TempCardIds.ShipMasterEudora_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === TempCardIds.ShipMasterEudora_G ? 2 : 1;
		addStatsToBoard(
			minion,
			input.boardWithDeadEntity,
			input.boardWithDeadEntityHero,
			5 * mult,
			5 * mult,
			input.gameState,
		);
		return [];
	},
};
