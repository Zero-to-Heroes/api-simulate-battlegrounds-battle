import { Race } from '@firestone-hs/reference-data';
import { pickRandom } from '../../../services/utils';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { hasCorrectTribe } from '../../../utils';
import { CastSpellInput, SpellCard } from '../../card.interface';

export const TimewarpedShoal: SpellCard = {
	cardIds: [TempCardIds.TimewarpedShoal, TempCardIds.TimewarpedShoal_G],
	castSpell: (spellCardId: string, input: CastSpellInput) => {
		const mult = spellCardId === TempCardIds.TimewarpedShoal_G ? 2 : 1;
		const nagas = input.board.filter((entity) =>
			hasCorrectTribe(entity, input.hero, Race.NAGA, input.gameState.anomalies, input.gameState.allCards),
		);
		const buff = 2 * nagas.length * mult;
		const target = input.target ?? pickRandom(input.board);
		if (!!target) {
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
