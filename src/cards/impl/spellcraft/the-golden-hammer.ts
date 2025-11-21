import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { makeMinionGolden } from '../../../simulation/utils/golden';
import { CastSpellInput, SpellCard } from '../../card.interface';

export const GoldGun: SpellCard = {
	cardIds: [CardIds.TheGoldenHammer_TheGoldenHammerToken],
	castSpell: (spellCardId: string, input: CastSpellInput) => {
		const target = input.target ?? pickRandom(input.board);
		if (!!target) {
			makeMinionGolden(
				target,
				input.source,
				input.board,
				input.hero,
				input.otherBoard,
				input.otherHero,
				input.gameState,
			);
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
