import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { modifyStats } from '../../../simulation/stats';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const TimewarpedEelectrify: TavernSpellCard = {
	cardIds: [
		CardIds.TimewarpedArcher_TimewarpedEelectrifyToken_BG34_Giant_212t,
		CardIds.TimewarpedArcher_TimewarpedEelectrifyToken_BG34_Giant_212_Gt,
	],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		const mult = spellCardId === CardIds.TimewarpedArcher_TimewarpedEelectrifyToken_BG34_Giant_212_Gt ? 2 : 1;
		const target = input.target ?? pickRandom(input.board);
		if (!!target) {
			modifyStats(target, input.source, 12 * mult, 0, input.board, input.hero, input.gameState);
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
