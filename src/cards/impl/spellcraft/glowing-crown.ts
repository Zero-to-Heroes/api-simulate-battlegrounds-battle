import { updateDivineShield } from '../../../keywords/divine-shield';
import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const GlowingCrown: TavernSpellCard = {
	cardIds: [CardIds.Glowscale_GlowingCrownToken_BG23_008t, CardIds.Glowscale_GlowingCrownToken_BG23_008_Gt],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		const target = input.target ?? pickRandom(input.board.filter((e) => !e.divineShield));
		if (!!target) {
			updateDivineShield(target, input.board, input.hero, input.otherHero, true, input.gameState);
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
