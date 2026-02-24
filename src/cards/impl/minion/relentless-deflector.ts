import { BoardEntity } from '../../../board-entity';
import { OnDivineShieldUpdatedInput, updateDivineShield } from '../../../keywords/divine-shield';
import { updateTaunt } from '../../../keywords/taunt';
import { CardIds } from '../../../services/card-ids';
import { AvengeInput } from '../../../simulation/avenge';
import { AvengeCard, OnDivineShieldUpdatedCard } from '../../card.interface';

export const RelentlessDeflector: AvengeCard & OnDivineShieldUpdatedCard = {
	cardIds: [CardIds.RelentlessDeflector_BG34_405, CardIds.RelentlessDeflector_BG34_405_G],
	baseAvengeValue: (cardId: string) => 3,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		updateDivineShield(minion, input.board, input.hero, input.otherHero, true, input.gameState);
	},
	onDivineShieldUpdated: (minion: BoardEntity, input: OnDivineShieldUpdatedInput) => {
		if (input.target === minion && input.newValue) {
			updateTaunt(minion, true, input.board, input.hero, input.otherHero, input.gameState);
		}
	},
};
