import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { modifyStats } from '../../../simulation/stats';
import { CastSpellInput, SpellCard } from '../../card.interface';

export const Thaumaturgy: SpellCard = {
	cardIds: [CardIds.Thaumaturgist_ThaumaturgyToken_BG31_924t, CardIds.Thaumaturgist_ThaumaturgyToken_BG31_924_Gt],
	castSpell: (spellCardId: string, input: CastSpellInput) => {
		const mult = spellCardId === CardIds.Thaumaturgist_ThaumaturgyToken_BG31_924t ? 1 : 2;
		const target = input.target ?? pickRandom(input.board);
		if (!!target) {
			const buff = (1 + Math.floor(input.hero.globalInfo.SpellsCastThisGame / 4)) * mult;
			modifyStats(target, input.source, buff, buff, input.board, input.hero, input.gameState);
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
