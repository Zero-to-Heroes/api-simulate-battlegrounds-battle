import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { OnStatsChangedInput } from '../../../simulation/stats';
import { addStatsToAliveBoard } from '../../../utils';
import { DeathrattleSpawnCard, OnStatsChangedCard } from '../../card.interface';

export const SepulchralSergeant: DeathrattleSpawnCard & OnStatsChangedCard = {
	cardIds: [CardIds.SepulchralSergeant_BG34_111, CardIds.SepulchralSergeant_BG34_111_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.SepulchralSergeant_BG34_111_G ? 2 : 1;
		// Not sure about that +1
		const base = 1 + (minion.scriptDataNum1 || 1);
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
		if (input.target === minion && input.attackAmount > 0) {
			minion.scriptDataNum1 = (minion.scriptDataNum1 || 2) + 1;
		}
	},
};
