import { updateDivineShield } from '../../../keywords/divine-shield';
import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const TimewarpedCrown: TavernSpellCard = {
	cardIds: [
		CardIds.TimewarpedGlowscale_TimewarpedCrownToken_BG34_Giant_035t,
		CardIds.TimewarpedCrown_BG34_Giant_035t_G,
	],
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
