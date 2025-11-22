import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { TempCardIds } from '../../../temp-card-ids';
import { AvengeCard } from '../../card.interface';

export const TimewarpedRecycler: AvengeCard = {
	cardIds: [TempCardIds.TimewarpedRecycler, TempCardIds.TimewarpedRecycler_G],
	baseAvengeValue: (cardId: string) => 6,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		// Do nothing in combat
	},
};
