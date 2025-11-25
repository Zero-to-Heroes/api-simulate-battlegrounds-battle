import { Race } from '@firestone-hs/reference-data';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const EvolvingStrategy: TavernSpellCard = {
	cardIds: [
		CardIds.DarkcrestStrategist_EvolvingStrategyToken_BG31_920t,
		CardIds.DarkcrestStrategist_EvolvingStrategyToken_BG31_920_Gt,
	],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		const mult = spellCardId === CardIds.DarkcrestStrategist_EvolvingStrategyToken_BG31_920t ? 1 : 2;
		for (let i = 0; i < mult; i++) {
			const naga = input.gameState.cardsData.getRandomMinionForTribe(Race.NAGA, 1);
			addCardsInHand(input.hero, input.board, [naga], input.gameState);
		}
	},
};
