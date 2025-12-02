import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { AvengeInput } from '../../../simulation/avenge';
import { AvengeCard } from '../../card.interface';

export const GhostlyYmirjar: AvengeCard = {
	cardIds: [CardIds.GhostlyYmirjar_BG34_697, CardIds.GhostlyYmirjar_BG34_697_G],
	baseAvengeValue: (cardId: string) => 4,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		// Nothing to do in combat
	},
};
