import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { TempCardIds } from '../../../temp-card-ids';
import { AvengeCard } from '../../card.interface';

export const GhostlyYmirjar: AvengeCard = {
	cardIds: [TempCardIds.GhostlyYmirjar, TempCardIds.GhostlyYmirjar_G],
	baseAvengeValue: (cardId: string) => 4,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		// Nothing to do in combat
	},
};
