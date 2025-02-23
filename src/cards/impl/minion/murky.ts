import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { pickRandom } from '../../../services/utils';
import { BattlecryInput } from '../../../simulation/battlecries';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { BattlecryCard } from '../../card.interface';

export const Murky: BattlecryCard = {
	cardIds: [CardIds.Murky_BG24_012, CardIds.Murky_BG24_012_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const murkyScale = minion.cardId === CardIds.Murky_BG24_012 ? 1 : 2;
		const murlocsControlled = input.board.filter((e) =>
			hasCorrectTribe(e, input.hero, Race.MURLOC, input.gameState.anomalies, input.gameState.allCards),
		).length;
		const murkyStats = murkyScale * 3 * murlocsControlled;
		const murkyTarget = pickRandom(
			input.board.filter((e) =>
				hasCorrectTribe(e, input.hero, Race.MURLOC, input.gameState.anomalies, input.gameState.allCards),
			),
		);
		if (!!murkyTarget) {
			modifyStats(murkyTarget, murkyStats, murkyStats, input.board, input.hero, input.gameState);
		}
	},
};
