import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { AvengeInput } from '../../../simulation/avenge';
import { addStatsToBoard } from '../../../utils';
import { AvengeCard } from '../../card.interface';

export const TimewarpedDuskmaw: AvengeCard = {
	cardIds: [CardIds.TimewarpedDuskmaw_BG34_PreMadeChamp_020, CardIds.TimewarpedDuskmaw_BG34_PreMadeChamp_020_G],
	baseAvengeValue: (cardId: string) => 1,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const mult = minion.cardId === CardIds.TimewarpedDuskmaw_BG34_PreMadeChamp_020_G ? 2 : 1;
		addStatsToBoard(minion, input.board, input.hero, 3 * mult, 3 * mult, input.gameState, Race[Race.DRAGON]);
	},
};
