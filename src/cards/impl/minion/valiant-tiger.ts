import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { DeathrattleSpawnCard } from '../../card.interface';

export const ValiantTiger: DeathrattleSpawnCard = {
	cardIds: [CardIds.ValiantTiger_BG32_202, CardIds.ValiantTiger_BG32_202_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.ValiantTiger_BG32_202 ? 1 : 2;
		const beasts = input.boardWithDeadEntity.filter((e) =>
			hasCorrectTribe(
				e,
				input.boardWithDeadEntityHero,
				Race.BEAST,
				input.gameState.anomalies,
				input.gameState.allCards,
			),
		);
		const target = beasts[beasts.length - 1];
		if (target) {
			modifyStats(
				target,
				minion,
				4 * mult,
				3 * mult,
				input.boardWithDeadEntity,
				input.boardWithDeadEntityHero,
				input.gameState,
			);
		}
		return [];
	},
};
