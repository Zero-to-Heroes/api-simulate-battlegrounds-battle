import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addStatsToBoard } from '../../../utils';
import { BattlecryCard } from '../../card.interface';

export const NerubianDeathswarmer: BattlecryCard = {
	cardIds: [CardIds.NerubianDeathswarmer_BG25_011, CardIds.NerubianDeathswarmer_BG25_011_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const nerubianDeathswarmerStats = minion.cardId === CardIds.NerubianDeathswarmer_BG25_011 ? 1 : 2;
		input.hero.globalInfo.UndeadAttackBonus =
			(input.hero.globalInfo?.UndeadAttackBonus ?? 0) + nerubianDeathswarmerStats;
		addStatsToBoard(
			minion,
			input.board,
			input.hero,
			nerubianDeathswarmerStats,
			0,
			input.gameState,
			Race[Race.UNDEAD],
		);
		return true;
	},
};
