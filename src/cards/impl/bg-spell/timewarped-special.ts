import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const TimewarpedSpecial: TavernSpellCard = {
	cardIds: [CardIds.TimewarpedSpecial_BG34_Treasure_950],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		const numberOfCardsToAdd = 10 - input.hero.hand.length;
		const cardsToAdd = Array(numberOfCardsToAdd).fill(null);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
