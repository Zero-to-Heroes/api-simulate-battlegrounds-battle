import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { grantStatsToMinionsOfEachType } from '../../../utils';
import { BattlecryCard } from '../../card.interface';

export const MenagerieJug: BattlecryCard = {
	cardIds: [CardIds.MenagerieJug_BGS_083, CardIds.MenagerieJug_TB_BaconUps_145],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === CardIds.MenagerieJug_BGS_083 ? 1 : 2;
		grantStatsToMinionsOfEachType(minion, input.board, input.hero, 3 * mult, 3 * mult, input.gameState, 3);
	},
};
