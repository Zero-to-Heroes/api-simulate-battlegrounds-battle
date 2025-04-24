import { BoardTrinket } from '../../../bgs-player-entity';
import { OnDivineShieldUpdatedInput } from '../../../keywords/divine-shield';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { OnDivineShieldUpdatedCard } from '../../card.interface';

export const DivineSignet: OnDivineShieldUpdatedCard = {
	cardIds: [TempCardIds.DivineSignet],
	onDivineShieldUpdated: (trinket: BoardTrinket, input: OnDivineShieldUpdatedInput) => {
		if (trinket.scriptDataNum1 > 0) {
			addCardsInHand(
				input.hero,
				input.board,
				[input.gameState.cardsData.getRandomTavernSpell()],
				input.gameState,
			);
			trinket.scriptDataNum1--;
		}
	},
};
