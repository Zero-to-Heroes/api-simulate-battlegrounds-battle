import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { addStatsToBoard } from '../../../utils';
import { DeathrattleSpawnCard } from '../../card.interface';

export const AnubarakNerubianKing: DeathrattleSpawnCard = {
	cardIds: [CardIds.AnubarakNerubianKing_BG25_007, CardIds.AnubarakNerubianKing_BG25_007_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const anubarakMultiplier = minion.cardId === CardIds.AnubarakNerubianKing_BG25_007_G ? 2 : 1;
		const attackBonus = anubarakMultiplier * 1;
		input.boardWithDeadEntityHero.globalInfo.UndeadAttackBonus += attackBonus;
		addStatsToBoard(
			minion,
			input.boardWithDeadEntity,
			input.boardWithDeadEntityHero,
			attackBonus,
			0,
			input.gameState,
			Race[Race.UNDEAD],
			// This causes Tentacle of C'Thun to gain stats
			// 33.6 https://replays.firestoneapp.com/?reviewId=4267ce35-80c7-47af-b0a0-33587fdc952c&turn=25&action=7
			true,
		);
		return [];
	},
};
