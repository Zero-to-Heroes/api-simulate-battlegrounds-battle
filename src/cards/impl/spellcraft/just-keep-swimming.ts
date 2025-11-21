import { updateStealth } from '../../../keywords/stealth';
import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { modifyStats } from '../../../simulation/stats';
import { CastSpellInput, SpellCard } from '../../card.interface';

export const JustKeepSwimming: SpellCard = {
	cardIds: [
		CardIds.SilentSwimmer_JustKeepSwimmingToken_BG26_171t,
		CardIds.SilentSwimmer_JustKeepSwimmingToken_BG26_171_Gt,
	],
	castSpell: (spellCardId: string, input: CastSpellInput) => {
		const mult = spellCardId === CardIds.SilentSwimmer_JustKeepSwimmingToken_BG26_171t ? 1 : 2;
		const target = input.target ?? pickRandom(input.board);
		if (!!target) {
			modifyStats(target, input.source, 3 * mult, 5 * mult, input.board, input.hero, input.gameState);
			updateStealth(target, true, input.board, input.hero, input.otherHero, input.gameState);
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
