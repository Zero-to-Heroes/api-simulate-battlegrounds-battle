import { CardIds } from '../../../services/card-ids';
import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { addStatsToBoard } from '../../../utils';
import { AvengeCard, DeathrattleSpawnCard } from '../../card.interface';

export const SilithidBurrower: DeathrattleSpawnCard & AvengeCard = {
	cardIds: [CardIds.SilithidBurrower_BG29_871, CardIds.SilithidBurrower_BG29_871_G],
	baseAvengeValue: (cardId: string) => 1,
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		// Not sure about which one to use
		// https://replays.firestoneapp.com/?reviewId=f05e3b55-152b-4a6d-afb4-c3180d24cfdd&turn=23&action=6
		// ^ in this, the Burrower has script1 = 29 and script2 = 1, and the minions get a +2 buff
		// This seems to indicate that script2 is used? Or is it simply an issue where Silithid Burrower loses
		// its permanent buffs, and script1 should be used?
		const mult = minion.cardId === CardIds.SilithidBurrower_BG29_871_G ? 2 : 1;
		const baseBuff = minion.scriptDataNum1 || mult;
		addStatsToBoard(
			minion,
			input.boardWithDeadEntity,
			input.boardWithDeadEntityHero,
			baseBuff,
			baseBuff,
			input.gameState,
			Race[Race.BEAST],
		);
		return [];
	},
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const mult = minion.cardId === CardIds.SilithidBurrower_BG29_871_G ? 2 : 1;
		minion.scriptDataNum1 = (minion.scriptDataNum1 || mult) + 1 * mult;
	},
};
