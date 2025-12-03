import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { CastSpellInput, TavernSpellCard } from '../../card.interface';

export const CrabMount: TavernSpellCard = {
	cardIds: [CardIds.SurfNSurf_CrabMountToken_BG27_004t, CardIds.SurfNSurf_CrabMountToken_BG27_004_Gt],
	castTavernSpell: (spellCardId: string, input: CastSpellInput) => {
		const target = input.target ?? pickRandom(input.board);
		if (!!target) {
			const enchantmentId =
				spellCardId === CardIds.SurfNSurf_CrabMountToken_BG27_004_Gt
					? CardIds.SurfNSurf_CrabRidingEnchantment_BG27_004_Ge
					: CardIds.SurfNSurf_CrabRidingEnchantment_BG27_004e;
			target.enchantments.push({
				cardId: enchantmentId,
				originEntityId: input.source.entityId,
				timing: input.gameState.sharedState.currentEntityId++,
			});
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
