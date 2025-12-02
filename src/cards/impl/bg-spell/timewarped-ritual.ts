import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const TimewarpedRitual: TavernSpellCard = {
	cardIds: [CardIds.TimewarpedRitual_BG34_Treasure_919],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		const cardsToAdd = [
			input.gameState.cardsData.getRandomMinionForTavernTier(7),
			input.gameState.cardsData.getRandomTavernSpell({ exactTavernTier: 7 }),
		];
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
