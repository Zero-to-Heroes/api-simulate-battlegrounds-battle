import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { CastSpellInput, SpellCard } from '../../card.interface';

export const TimewarpedSpecial: SpellCard = {
	cardIds: [TempCardIds.TimewarpedSpecial],
	castSpell: (spellCardId: string, input: CastSpellInput) => {
		const numberOfCardsToAdd = 10 - input.hero.hand.length;
		const cardsToAdd = Array(numberOfCardsToAdd).fill(null);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
