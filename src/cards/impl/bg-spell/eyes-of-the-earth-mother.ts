import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { makeMinionGolden } from '../../../simulation/utils/golden';
import { isGolden } from '../../../utils';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const EyesOfTheEarthMother: TavernSpellCard = {
	cardIds: [CardIds.EyesOfTheEarthMother_EBG_Spell_017],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		const targets = input.board.filter((e) => e.tavernTier <= 4 && !isGolden(e.cardId, input.gameState.allCards));
		const target = pickRandom(targets);
		if (!target) {
			return;
		}
		makeMinionGolden(
			target,
			input.source,
			input.board,
			input.hero,
			input.otherBoard,
			input.otherHero,
			input.gameState,
		);
		input.gameState.spectator.registerPowerTarget(input.source, target, input.board, input.hero, input.otherHero);
	},
};
