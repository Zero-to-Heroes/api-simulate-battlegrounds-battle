import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { CastSpellInput, SpellCard } from '../../card.interface';

export const TimewarpedBananas: SpellCard = {
	cardIds: [TempCardIds.TimewarpedBananas],
	castSpell: (spellCardId: string, input: CastSpellInput) => {
		const numberOfCardsToAdd = 10 - input.hero.hand.length;
		const cardsToAdd = Array(numberOfCardsToAdd).fill(CardIds.TavernDishBanana_BG28_897);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
		input.hero.globalInfo.TavernSpellAttackBuff += 2;
		input.hero.globalInfo.TavernSpellHealthBuff += 2;
	},
};
