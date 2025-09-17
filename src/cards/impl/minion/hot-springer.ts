import { CardIds } from '../../../services/card-ids';
import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { BattlecryCard } from '../../card.interface';

export const HotSpringer: BattlecryCard = {
	cardIds: [CardIds.HotSpringer_BG33_895, CardIds.HotSpringer_BG33_895_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput): boolean => {
		const mult = minion.cardId === CardIds.HotSpringer_BG33_895_G ? 2 : 1;
		const targets = input.board.filter(
			(e) =>
				e !== minion &&
				hasCorrectTribe(e, input.hero, Race.MURLOC, input.gameState.anomalies, input.gameState.allCards),
		);
		for (const target of targets) {
			modifyStats(target, minion, 0, 3 * mult, input.board, input.hero, input.gameState);
		}
		return true;
	},
};
