import { Race } from '@firestone-hs/reference-data';
import { updateWindfury } from '../../../keywords/windfury';
import { pickRandom } from '../../../services/utils';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { hasCorrectTribe } from '../../../utils';
import { CastSpellInput, SpellCard } from '../../card.interface';

export const UnderseaMount: SpellCard = {
	cardIds: [TempCardIds.UnderseaMount, TempCardIds.UnderseaMount_G],
	castSpell: (spellCardId: string, input: CastSpellInput) => {
		const mult = spellCardId === TempCardIds.UnderseaMount_G ? 1 : 2;
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
