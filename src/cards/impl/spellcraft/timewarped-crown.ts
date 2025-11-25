import { updateDivineShield } from '../../../keywords/divine-shield';
import { pickRandom } from '../../../services/utils';
import { TempCardIds } from '../../../temp-card-ids';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const TimewarpedCrown: TavernSpellCard = {
	cardIds: [TempCardIds.TimewarpedCrown, TempCardIds.TimewarpedCrown_G],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		const target = input.target ?? pickRandom(input.board.filter((e) => !e.divineShield));
		if (!!target) {
			updateDivineShield(target, input.board, input.hero, input.otherHero, true, input.gameState);
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
