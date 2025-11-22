import { updateTaunt } from '../../../keywords/taunt';
import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { modifyStats } from '../../../simulation/stats';
import { CastSpellInput, SpellCard } from '../../card.interface';

export const AnglersLure: SpellCard = {
	cardIds: [CardIds.DeepSeaAngler_AnglersLureToken_BG23_004t, CardIds.DeepSeaAngler_AnglersLureToken_BG23_004_Gt],
	castSpell: (spellCardId: string, input: CastSpellInput) => {
		const mult = spellCardId === CardIds.DeepSeaAngler_AnglersLureToken_BG23_004_Gt ? 2 : 1;
		const target = input.target ?? pickRandom(input.board);
		if (!!target) {
			modifyStats(target, input.source, 2 * mult, 6 * mult, input.board, input.hero, input.gameState);
			updateTaunt(target, true, input.board, input.hero, input.otherHero, input.gameState);
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
