import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { CastSpellInput, SpellCard } from '../../card.interface';

export const TimewarpedCorpse: SpellCard = {
	cardIds: [TempCardIds.TimewarpedCorpse],
	castSpell: (spellCardId: string, input: CastSpellInput) => {
		const cardsToAdd = [input.gameState.cardsData.getRandomMinionForMinTavernTier(5)];
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
