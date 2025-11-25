import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const TimewarpedOnTheHouse: TavernSpellCard = {
	cardIds: [TempCardIds.TimewarpedOnTheHouse],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		const cardsToAdd = Array(2).map(() =>
			input.gameState.cardsData.getRandomMinionForTavernTier(input.hero.tavernTier ?? 5),
		);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
