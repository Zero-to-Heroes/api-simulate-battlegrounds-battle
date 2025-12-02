import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { AvengeInput } from '../../../simulation/avenge';
import { AvengeCard } from '../../card.interface';

export const TimewarpedRecycler: AvengeCard = {
	cardIds: [CardIds.TimewarpedRecycler_BG34_Giant_082, CardIds.TimewarpedRecycler_BG34_Giant_082_G],
	baseAvengeValue: (cardId: string) => 6,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		// Do nothing in combat
	},
};
