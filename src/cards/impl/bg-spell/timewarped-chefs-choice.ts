import { pickRandom } from '../../../services/utils';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { CastSpellInput, SpellCard } from '../../card.interface';

export const TimewarpedChefsChoice: SpellCard = {
	cardIds: [TempCardIds.TimewarpedChefsChoice],
	castSpell: (spellCardId: string, input: CastSpellInput) => {
		// TODO: filter to only target minion with types
		const target = input.target ?? pickRandom(input.board);
		if (!!target) {
			const cardsToAdd = [null, null, null];
			addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
		}
	},
};
