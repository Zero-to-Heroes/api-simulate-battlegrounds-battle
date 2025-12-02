import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const TimewarpedCorpse: TavernSpellCard = {
	cardIds: [CardIds.TimewarpedCorpse_BG34_Treasure_937],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		const cardsToAdd = [input.gameState.cardsData.getRandomMinionForMinTavernTier(5)];
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
