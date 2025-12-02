import { Race } from '@firestone-hs/reference-data';
import { updateWindfury } from '../../../keywords/windfury';
import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const UnderseaMount: TavernSpellCard = {
	cardIds: [CardIds.Waverider_UnderseaMountToken_BG23_007_Gt, CardIds.Waverider_UnderseaMountToken_BG23_007_Gt],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		const mult = spellCardId === CardIds.Waverider_UnderseaMountToken_BG23_007_Gt ? 2 : 1;
		const target = input.target ?? pickRandom(input.board);
		if (!!target) {
			modifyStats(target, input.source, 2 * mult, 2 * mult, input.board, input.hero, input.gameState);
			if (hasCorrectTribe(target, input.hero, Race.NAGA, input.gameState.anomalies, input.gameState.allCards)) {
				updateWindfury(target, true, input.board, input.hero, input.otherHero, input.gameState);
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
