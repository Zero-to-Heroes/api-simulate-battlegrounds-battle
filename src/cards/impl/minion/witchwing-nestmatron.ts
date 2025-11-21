import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { AvengeInput } from '../../../simulation/avenge';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { AvengeCard } from '../../card.interface';

export const WitchwingNestmatron: AvengeCard = {
	cardIds: [CardIds.WitchwingNestmatron_BG21_038, CardIds.WitchwingNestmatron_BG21_038_G],
	baseAvengeValue: (cardId: string) => 3,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const loops = minion.cardId === CardIds.WitchwingNestmatron_BG21_038_G ? 2 : 1;
		const nestmatronCardsToAdd = [];
		for (let i = 0; i < loops; i++) {
			nestmatronCardsToAdd.push(pickRandom(input.gameState.cardsData.battlecryMinions));
		}
		addCardsInHand(input.hero, input.board, nestmatronCardsToAdd, input.gameState);
	},
};
