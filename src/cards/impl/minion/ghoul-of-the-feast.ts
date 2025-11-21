import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { TempCardIds } from '../../../temp-card-ids';
import { grantStatsToMinionsOfEachType } from '../../../utils';
import { AvengeCard } from '../../card.interface';

export const GhoulOfTheFeast: AvengeCard = {
	cardIds: [TempCardIds.GhoulOfTheFeast, TempCardIds.GhoulOfTheFeast_G],
	baseAvengeValue: (cardId: string) => 1,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const mult = minion.cardId === TempCardIds.GhoulOfTheFeast_G ? 2 : 1;
		grantStatsToMinionsOfEachType(minion, input.board, input.hero, 1 * mult, 2 * mult, input.gameState);
	},
};
