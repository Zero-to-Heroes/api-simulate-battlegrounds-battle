import { pickRandom } from '../../../services/utils';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { CastSpellInput, SpellCard } from '../../card.interface';

export const TimewarpedRatInTheCage: SpellCard = {
	cardIds: [TempCardIds.TimewarpedRatInTheCage],
	castSpell: (spellCardId: string, input: CastSpellInput) => {
		const target = input.target ?? pickRandom(input.board);
		if (!!target) {
			modifyStats(target, input.source, 2, 2, input.board, input.hero, input.gameState);
			modifyStats(target, input.source, target.attack, target.health, input.board, input.hero, input.gameState);
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
