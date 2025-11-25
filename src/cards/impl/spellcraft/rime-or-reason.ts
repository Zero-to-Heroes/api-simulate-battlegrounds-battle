import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const RimeOrReason: TavernSpellCard = {
	cardIds: [
		CardIds.RimescalePriestess_RimeOrReasonToken_BG33_319t,
		CardIds.RimescalePriestess_RimeOrReasonToken_BG33_319_Gt,
	],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		const mult = spellCardId === CardIds.RimescalePriestess_RimeOrReasonToken_BG33_319t ? 1 : 2;
		for (let i = 0; i < mult; i++) {
			// TODO: should be a spell that "grant stats"
			const spell = input.gameState.cardsData.getRandomTavernSpell();
			addCardsInHand(input.hero, input.board, [spell], input.gameState);
		}
	},
};
