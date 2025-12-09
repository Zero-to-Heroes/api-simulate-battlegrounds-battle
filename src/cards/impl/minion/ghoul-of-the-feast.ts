import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { AvengeInput } from '../../../simulation/avenge';
import { grantStatsToMinionsOfEachType } from '../../../utils';
import { AvengeCard } from '../../card.interface';

export const GhoulOfTheFeast: AvengeCard = {
	cardIds: [CardIds.GhoulOfTheFeast_BG25_002, CardIds.GhoulOfTheFeast_BG25_002_G],
	baseAvengeValue: (cardId: string) => 1,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const mult = minion.cardId === CardIds.GhoulOfTheFeast_BG25_002_G ? 2 : 1;
		grantStatsToMinionsOfEachType(minion, input.board, input.hero, 2 * mult, 2 * mult, input.gameState);
	},
};
