import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const TimewarpedRitual: TavernSpellCard = {
	cardIds: [TempCardIds.TimewarpedRitual],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		const cardsToAdd = [
			input.gameState.cardsData.getRandomMinionForTavernTier(7),
			input.gameState.cardsData.getRandomTavernSpell({ exactTavernTier: 7 }),
		];
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
