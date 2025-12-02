import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { makeMinionGolden } from '../../../simulation/utils/golden';
import { isGolden } from '../../../utils';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const TimewarpedGoldenizer: TavernSpellCard = {
	cardIds: [CardIds.TimewarpedGoldenizer_BG34_Treasure_955],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		const target =
			input.target ?? pickRandom(input.board.filter((e) => !isGolden(e.cardId, input.gameState.allCards)));
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
