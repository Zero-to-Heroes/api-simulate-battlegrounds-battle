import { CardIds } from '../../../services/card-ids';
import { BoardTrinket } from '../../../bgs-player-entity';
import { OnDivineShieldUpdatedInput } from '../../../keywords/divine-shield';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { OnDivineShieldUpdatedCard } from '../../card.interface';

export const DivineSignet: OnDivineShieldUpdatedCard = {
	cardIds: [CardIds.DivineSignet_BG32_MagicItem_171],
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
