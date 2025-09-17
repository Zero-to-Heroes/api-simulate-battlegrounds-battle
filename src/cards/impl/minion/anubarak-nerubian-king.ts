import { CardIds } from '../../../services/card-ids';
import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
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
			false,
		);
		return [];
	},
};
