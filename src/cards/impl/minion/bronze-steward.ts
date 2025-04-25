import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { BattlecryCard, DeathrattleEffectCard } from '../../card.interface';

export const BronzeSteward: BattlecryCard & DeathrattleEffectCard = {
	cardIds: [CardIds.BronzeSteward_BG32_824, CardIds.BronzeSteward_BG32_824_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === CardIds.BronzeSteward_BG32_824_G ? 2 : 1;
		const targets = input.board
			.filter((e) => e.entityId !== minion.entityId)
			.filter((e) =>
				hasCorrectTribe(e, input.hero, Race.DRAGON, input.gameState.anomalies, input.gameState.allCards),
			);
		targets.forEach((target) => {
			modifyStats(target, minion, 7 * mult, 0, input.board, input.hero, input.gameState);
		});
		return true;
	},
	deathrattleEffect: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.BronzeSteward_BG32_824_G ? 2 : 1;
		const targets = input.boardWithDeadEntity
			.filter((e) => e.entityId !== minion.entityId)
			.filter((e) =>
				hasCorrectTribe(
					e,
					input.boardWithDeadEntityHero,
					Race.DRAGON,
					input.gameState.anomalies,
					input.gameState.allCards,
				),
			);
		targets.forEach((target) => {
			modifyStats(
				target,
				minion,
				7 * mult,
				0,
				input.boardWithDeadEntity,
				input.boardWithDeadEntityHero,
				input.gameState,
			);
		});
	},
};
