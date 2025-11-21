import { Race } from '@firestone-hs/reference-data';
import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { makeMinionGolden } from '../../../simulation/utils/golden';
import { hasCorrectTribe } from '../../../utils';
import { CastSpellInput, SpellCard } from '../../card.interface';

export const GoldGun: SpellCard = {
	cardIds: [CardIds.GretaGoldGun_GoldGunToken],
	castSpell: (spellCardId: string, input: CastSpellInput) => {
		const target =
			input.target ??
			pickRandom(
				input.board
					.filter(
						(e) =>
							![CardIds.GretaGoldGun_BG25_044, CardIds.GretaGoldGun_GoldGunToken].includes(
								e.cardId as CardIds,
							),
					)
					.filter(
						(e) =>
							hasCorrectTribe(
								e,
								input.hero,
								Race.NAGA,
								input.gameState.anomalies,
								input.gameState.allCards,
							) ||
							hasCorrectTribe(
								e,
								input.hero,
								Race.PIRATE,
								input.gameState.anomalies,
								input.gameState.allCards,
							),
					),
			);
		if (!!target) {
			makeMinionGolden(
				target,
				input.source,
				input.board,
				input.hero,
				input.otherBoard,
				input.otherHero,
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
