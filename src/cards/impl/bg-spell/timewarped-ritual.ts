import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { CastSpellInput, SpellCard } from '../../card.interface';

export const TimewarpedRitual: SpellCard = {
	cardIds: [TempCardIds.TimewarpedRitual],
	castSpell: (spellCardId: string, input: CastSpellInput) => {
		const cardsToAdd = [
			input.gameState.cardsData.getRandomMinionForTavernTier(7),
			input.gameState.cardsData.getRandomTavernSpell({ exactTavernTier: 7 }),
		];
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
