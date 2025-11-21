import { Race } from '@firestone-hs/reference-data';
import { updateReborn } from '../../../keywords/reborn';
import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { CastSpellInput, SpellCard } from '../../card.interface';

export const Reinvigoration: SpellCard = {
	cardIds: [CardIds.WearyMage_ReinvigorationToken_BG31_830t, CardIds.WearyMage_ReinvigorationToken_BG31_830_Gt],
	castSpell: (spellCardId: string, input: CastSpellInput) => {
		const mult = spellCardId === CardIds.WearyMage_ReinvigorationToken_BG31_830_Gt ? 1 : 2;
		const target = input.target ?? pickRandom(input.board);
		if (!!target) {
			modifyStats(target, input.source, 2 * mult, 2 * mult, input.board, input.hero, input.gameState);
			if (hasCorrectTribe(target, input.hero, Race.NAGA, input.gameState.anomalies, input.gameState.allCards)) {
				updateReborn(target, true, input.board, input.hero, input.otherHero, input.gameState);
			}
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
