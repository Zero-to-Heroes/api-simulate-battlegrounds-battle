import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addStatsToBoard } from '../../../utils';
import { BattlecryCard } from '../../card.interface';

export const KingBagurgle: BattlecryCard = {
	cardIds: [CardIds.KingBagurgle_BGS_030, CardIds.KingBagurgle_TB_BaconUps_100],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		addStatsToBoard(
			minion,
			input.board.filter((e) => e.entityId != minion.entityId),
			input.hero,
			minion.cardId === CardIds.KingBagurgle_BGS_030 ? 3 : 6,
			minion.cardId === CardIds.KingBagurgle_BGS_030 ? 3 : 6,
			input.gameState,
			Race[Race.MURLOC],
		);
	},
};
