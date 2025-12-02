import { Race } from '@firestone-hs/reference-data';
import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const TimewarpedShoal: TavernSpellCard = {
	cardIds: [
		CardIds.TimewarpedCommander_TimewarpedShoalToken_BG34_Giant_210t,
		CardIds.TimewarpedCommander_TimewarpedShoalToken_BG34_Giant_210_Gt,
	],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		const mult = spellCardId === CardIds.TimewarpedCommander_TimewarpedShoalToken_BG34_Giant_210_Gt ? 2 : 1;
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
