import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { modifyStats } from '../../../simulation/stats';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const TimewarpedRatInTheCage: TavernSpellCard = {
	cardIds: [CardIds.TimewarpedRatInACage_BG34_Treasure_905],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		const target = input.target ?? pickRandom(input.board);
		if (!!target) {
			modifyStats(target, input.source, 2, 2, input.board, input.hero, input.gameState);
			modifyStats(target, input.source, target.attack, target.health, input.board, input.hero, input.gameState);
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
