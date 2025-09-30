import { Race } from '@firestone-hs/reference-data';
import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { CastSpellInput, SpellCard } from '../../card.interface';

export const MurkysFish: SpellCard = {
	cardIds: [CardIds.MurkysFish_BG33_898],
	castSpell: (spellCardId: string, input: CastSpellInput) => {
		const murlocs = input.board.filter((e) =>
			hasCorrectTribe(e, input.hero, Race.MURLOC, input.gameState.anomalies, input.gameState.allCards),
		);
		const target = pickRandom(murlocs);
		if (!!target) {
			const loops = 1 + murlocs.length;
			for (let i = 0; i < loops; i++) {
				modifyStats(target, input.source, 1, 1, input.board, input.hero, input.gameState);
			}
		}
	},
};
