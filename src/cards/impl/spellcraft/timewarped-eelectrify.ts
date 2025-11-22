import { pickRandom } from '../../../services/utils';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { CastSpellInput, SpellCard } from '../../card.interface';

export const TimewarpedEelectrify: SpellCard = {
	cardIds: [TempCardIds.TimewarpedEelectrify, TempCardIds.TimewarpedEelectrify_G],
	castSpell: (spellCardId: string, input: CastSpellInput) => {
		const mult = spellCardId === TempCardIds.TimewarpedEelectrify_G ? 2 : 1;
		const target = input.target ?? pickRandom(input.board);
		if (!!target) {
			modifyStats(target, input.source, 12 * mult, 0, input.board, input.hero, input.gameState);
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
