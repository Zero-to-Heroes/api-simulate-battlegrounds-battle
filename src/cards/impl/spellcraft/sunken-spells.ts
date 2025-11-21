import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { CastSpellInput, SpellCard } from '../../card.interface';

export const SunkenSpells: SpellCard = {
	cardIds: [
		CardIds.SilivazTheVindictive_SunkenSpellsToken_BG28_405t,
		CardIds.SilivazTheVindictive_SunkenSpellsToken_BG28_405_Gt,
	],
	castSpell: (spellCardId: string, input: CastSpellInput) => {
		const mult = spellCardId === CardIds.SilivazTheVindictive_SunkenSpellsToken_BG28_405t ? 1 : 2;
		for (let i = 0; i < mult; i++) {
			const spell = input.gameState.cardsData.getRandomTavernSpell();
			addCardsInHand(input.hero, input.board, [spell], input.gameState);
		}
	},
};
