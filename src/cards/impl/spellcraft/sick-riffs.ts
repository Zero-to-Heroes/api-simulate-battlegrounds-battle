import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { modifyStats } from '../../../simulation/stats';
import { CastSpellInput, SpellCard } from '../../card.interface';

export const SickRiffs: SpellCard = {
	cardIds: [CardIds.ReefRiffer_SickRiffsToken_BG26_501t, CardIds.ReefRiffer_SickRiffsToken_BG26_501_Gt],
	castSpell: (spellCardId: string, input: CastSpellInput) => {
		const mult = spellCardId === CardIds.ReefRiffer_SickRiffsToken_BG26_501t ? 1 : 2;
		const target = input.target ?? pickRandom(input.board);
		if (!!target) {
			const buff = (input.hero.tavernTier ?? 1) * mult;
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
