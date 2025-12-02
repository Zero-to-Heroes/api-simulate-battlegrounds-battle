import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { modifyStats } from '../../../simulation/stats';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const DeepBlues: TavernSpellCard = {
	cardIds: [CardIds.DeepBlueCrooner_DeepBluesToken_BG26_502t, CardIds.DeepBlueCrooner_DeepBluesToken_BG26_502_Gt],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		const mult = spellCardId === CardIds.DeepBlueCrooner_DeepBluesToken_BG26_502t ? 1 : 2;
		const target = input.target ?? pickRandom(input.board);
		if (!!target) {
			const currentBuff = input.hero.globalInfo.DeepBluesPlayed;
			modifyStats(
				target,
				input.source,
				2 * currentBuff * mult,
				3 * currentBuff * mult,
				input.board,
				input.hero,
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
