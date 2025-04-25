import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { hasCorrectTribe } from '../../../utils';
import { DeathrattleEffectCard } from '../../card.interface';

export const ValiantTiger: DeathrattleEffectCard = {
	cardIds: [TempCardIds.ValiantTiger, TempCardIds.ValiantTiger_G],
	deathrattleEffect: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === TempCardIds.ValiantTiger ? 1 : 2;
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
	},
};
