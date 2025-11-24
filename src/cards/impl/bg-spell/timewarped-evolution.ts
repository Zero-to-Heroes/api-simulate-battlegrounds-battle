import { pickRandom } from '../../../services/utils';
import { TempCardIds } from '../../../temp-card-ids';
import { CastSpellInput, SpellCard } from '../../card.interface';

export const TimewarpedEvolution: SpellCard = {
	cardIds: [TempCardIds.TimewarpedEvolution],
	castSpell: (spellCardId: string, input: CastSpellInput) => {
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
