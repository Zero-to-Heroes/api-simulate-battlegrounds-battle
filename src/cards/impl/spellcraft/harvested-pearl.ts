import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { modifyStats } from '../../../simulation/stats';
import { CastSpellInput, SpellCard } from '../../card.interface';

export const HarvestedPearl: SpellCard = {
	cardIds: [CardIds.PreciousPearl_HarvestedPearlToken_BG30_MagicItem_714t],
	castSpell: (spellCardId: string, input: CastSpellInput) => {
		const target = input.target ?? pickRandom(input.board);
		if (!!target) {
			modifyStats(target, input.source, 30, 30, input.board, input.hero, input.gameState);
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
