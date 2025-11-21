import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { OnStatsChangedInput } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { addStatsToAliveBoard } from '../../../utils';
import { DeathrattleSpawnCard, OnStatsChangedCard } from '../../card.interface';

export const SepulchralSergeant: DeathrattleSpawnCard & OnStatsChangedCard = {
	cardIds: [TempCardIds.SepulcralSergeant, TempCardIds.SepulcralSergeant_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === TempCardIds.SepulcralSergeant_G ? 2 : 1;
		const base = minion.scriptDataNum1 || 2;
		const buff = base * mult;
		addStatsToAliveBoard(
			minion,
			input.boardWithDeadEntity,
			input.boardWithDeadEntityHero,
			0,
			buff,
			input.gameState,
		);
		return [];
	},
	onStatsChanged: (minion: BoardEntity, input: OnStatsChangedInput) => {
		minion.scriptDataNum1 = (minion.scriptDataNum1 || 2) + 2;
	},
};
