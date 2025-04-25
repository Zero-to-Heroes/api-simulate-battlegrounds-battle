import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { addStatsToBoard } from '../../../utils';
import { AvengeCard, DeathrattleEffectCard } from '../../card.interface';

export const SilithidBurrower: DeathrattleEffectCard & AvengeCard = {
	cardIds: [CardIds.SilithidBurrower_BG29_871, CardIds.SilithidBurrower_BG29_871_G],
	baseAvengeValue: (cardId: string) => 3,
	deathrattleEffect: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.SilithidBurrower_BG29_871_G ? 2 : 1;
		const baseBuff = minion.scriptDataNum1 || 1;
		addStatsToBoard(
			minion,
			input.boardWithDeadEntity,
			input.boardWithDeadEntityHero,
			baseBuff * mult,
			baseBuff * mult,
			input.gameState,
			Race[Race.BEAST],
		);
	},
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		minion.scriptDataNum1 = (minion.scriptDataNum1 || 1) + 1;
	},
};
