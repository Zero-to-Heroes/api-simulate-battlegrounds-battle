import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { modifyStats } from '../../../simulation/stats';
import { CastSpellInput, SpellCard } from '../../card.interface';

export const MiniTrident: SpellCard = {
	cardIds: [CardIds.MiniMyrmidon_MiniTridentToken_BG23_000t, CardIds.MiniMyrmidon_MiniTridentToken_BG23_000_Gt],
	castSpell: (spellCardId: string, input: CastSpellInput) => {
		const mult = spellCardId === CardIds.MiniMyrmidon_MiniTridentToken_BG23_000t ? 1 : 2;
		const target = input.target ?? pickRandom(input.board);
		if (!!target) {
			modifyStats(target, input.source, 2 * mult, 0, input.board, input.hero, input.gameState);
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
