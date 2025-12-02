import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const TimewarpedChefsChoice: TavernSpellCard = {
	cardIds: [CardIds.TimewarpedChefsChoice_BG34_Treasure_940],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		// TODO: filter to only target minion with types
		const target = input.target ?? pickRandom(input.board);
		if (!!target) {
			const cardsToAdd = [null, null, null];
			addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
		}
	},
};
