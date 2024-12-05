import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { addStatsToBoard } from '../../../utils';
import { DeathrattleEffectCard } from '../../card.interface';

export const ShowyCyclist: DeathrattleEffectCard = {
	cardIds: [CardIds.ShowyCyclist_BG31_925, CardIds.ShowyCyclist_BG31_925_G],
	deathrattleEffect: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const baseBuff = minion.scriptDataNum2;
		const mult = minion.cardId === CardIds.ShowyCyclist_BG31_925_G ? 2 : 1;
		const buff = baseBuff * mult;
		addStatsToBoard(
			minion,
			input.boardWithDeadEntity,
			input.boardWithDeadEntityHero,
			1 * buff,
			1 * buff,
			input.gameState,
		);
	},
};
