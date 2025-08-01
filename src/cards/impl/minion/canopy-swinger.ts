import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { BattlecryCard } from '../../card.interface';

export const CanopySwinger: BattlecryCard = {
	cardIds: [CardIds.CanopySwinger_BG33_896, CardIds.CanopySwinger_BG33_896_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput): boolean => {
		const mult = minion.cardId === CardIds.CanopySwinger_BG33_896_G ? 2 : 1;
		const targets = input.board.filter(
			(e) =>
				e !== minion &&
				hasCorrectTribe(e, input.hero, Race.MURLOC, input.gameState.anomalies, input.gameState.allCards),
		);
		for (const target of targets) {
			modifyStats(target, minion, 2 * mult, 0, input.board, input.hero, input.gameState);
		}
		return true;
	},
};
