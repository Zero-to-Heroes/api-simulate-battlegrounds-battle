import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const TimewarpedOnTheHouse: TavernSpellCard = {
	cardIds: [CardIds.TimewarpedOnTheHouse_BG34_Treasure_903],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		const cardsToAdd = Array.from({ length: 2 }).map(() =>
			input.gameState.cardsData.getRandomMinionForTavernTier(input.hero.tavernTier ?? 5),
		);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
