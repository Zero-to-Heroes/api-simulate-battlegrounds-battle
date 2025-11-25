import { updateDivineShield } from '../../../keywords/divine-shield';
import { updateWindfury } from '../../../keywords/windfury';
import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const RushingWinds: TavernSpellCard = {
	cardIds: [CardIds.RushingWinds_RushingWindsToken_BG33_Reward_006t],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		const target = input.target ?? pickRandom(input.board);
		if (!!target) {
			updateDivineShield(target, input.board, input.hero, input.otherHero, true, input.gameState);
			updateWindfury(target, true, input.board, input.hero, input.otherHero, input.gameState);
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
