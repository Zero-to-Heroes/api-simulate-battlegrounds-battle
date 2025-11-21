import { Race } from '@firestone-hs/reference-data';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { CastSpellInput, SpellCard } from '../../card.interface';

export const AzsharasHatchery: SpellCard = {
	cardIds: [
		CardIds.OrgozoaTheTender_AzsharasHatcheryToken_BG23_015t,
		CardIds.OrgozoaTheTender_AzsharasHatcheryToken_BG23_015_Gt,
	],
	castSpell: (spellCardId: string, input: CastSpellInput) => {
		const mult = spellCardId === CardIds.OrgozoaTheTender_AzsharasHatcheryToken_BG23_015_Gt ? 1 : 2;
		for (let i = 0; i < mult; i++) {
			const naga = input.gameState.cardsData.getRandomMinionForTribe(Race.NAGA, input.hero.tavernTier ?? 1);
			addCardsInHand(input.hero, input.board, [naga], input.gameState);
		}
	},
};
