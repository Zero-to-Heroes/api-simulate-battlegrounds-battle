import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { makeMinionGolden } from '../../../simulation/utils/golden';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const GoldGun: TavernSpellCard = {
	cardIds: [CardIds.TheGoldenHammer_TheGoldenHammerToken],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
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
