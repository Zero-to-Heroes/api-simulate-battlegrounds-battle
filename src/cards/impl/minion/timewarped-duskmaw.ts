import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { TempCardIds } from '../../../temp-card-ids';
import { addStatsToBoard } from '../../../utils';
import { AvengeCard } from '../../card.interface';

export const TimewarpedDuskmaw: AvengeCard = {
	cardIds: [TempCardIds.TimewarpedDuskmaw, TempCardIds.TimewarpedDuskmaw_G],
	baseAvengeValue: (cardId: string) => 1,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedDuskmaw_G ? 2 : 1;
		addStatsToBoard(minion, input.board, input.hero, 3 * mult, 3 * mult, input.gameState, Race[Race.DRAGON]);
	},
};
