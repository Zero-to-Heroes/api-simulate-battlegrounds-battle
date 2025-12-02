import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const TimewarpedEvolution: TavernSpellCard = {
	cardIds: [CardIds.TimewarpedEvolution_BG34_Treasure_933],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		const target = input.target ?? pickRandom(input.board);
		if (!!target) {
			const transformInto = input.gameState.cardsData.getRandomMinionForTavernTier(6);
			target.cardId = transformInto;
			input.gameState.spectator.registerPowerTarget(
				input.source,
				target,
				input.board,
				input.hero,
				input.otherHero,
			);
		}
	},
};
