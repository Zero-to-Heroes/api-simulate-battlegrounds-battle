import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { modifyStats } from '../../../simulation/stats';
import { CastSpellInput, SpellCard } from '../../card.interface';

export const DeepBlues: SpellCard = {
	cardIds: [CardIds.DeepBlueCrooner_DeepBluesToken_BG26_502t, CardIds.DeepBlueCrooner_DeepBluesToken_BG26_502_Gt],
	castSpell: (spellCardId: string, input: CastSpellInput) => {
		const mult = spellCardId === CardIds.DeepBlueCrooner_DeepBluesToken_BG26_502t ? 1 : 2;
		const target = input.target ?? pickRandom(input.board);
		if (!!target) {
			// TODO: use Deep Blue buff value
			modifyStats(target, input.source, 2 * mult, 3 * mult, input.board, input.hero, input.gameState);
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
