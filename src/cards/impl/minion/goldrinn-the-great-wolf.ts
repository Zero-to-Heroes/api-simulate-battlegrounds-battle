import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { addStatsToBoard } from '../../../utils';
import { DeathrattleEffectCard } from '../../card.interface';

export const GoldrinnTheGreatWolf: DeathrattleEffectCard = {
	cardIds: [CardIds.GoldrinnTheGreatWolf_BGS_018, CardIds.GoldrinnTheGreatWolf_TB_BaconUps_085],
	deathrattleEffect: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const goldrinnBuff = minion.cardId === CardIds.GoldrinnTheGreatWolf_TB_BaconUps_085 ? 6 : 3;
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
	},
};
