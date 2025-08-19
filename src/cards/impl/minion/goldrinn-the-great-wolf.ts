import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { addStatsToBoard } from '../../../utils';
import { DeathrattleSpawnCard } from '../../card.interface';

export const GoldrinnTheGreatWolf: DeathrattleSpawnCard = {
	cardIds: [CardIds.GoldrinnTheGreatWolf_BGS_018, CardIds.GoldrinnTheGreatWolf_TB_BaconUps_085],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const goldrinnBuff = minion.cardId === CardIds.GoldrinnTheGreatWolf_TB_BaconUps_085 ? 10 : 5;
		addStatsToBoard(
			minion,
			input.boardWithDeadEntity,
			input.boardWithDeadEntityHero,
			goldrinnBuff,
			goldrinnBuff,
			input.gameState,
			Race[Race.BEAST],
		);
		input.boardWithDeadEntityHero.globalInfo.GoldrinnBuffAtk += goldrinnBuff;
		input.boardWithDeadEntityHero.globalInfo.GoldrinnBuffHealth += goldrinnBuff;
		return [];
	},
};
