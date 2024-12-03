import { CardIds } from '@firestone-hs/reference-data';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleEnchantmentEffectCard } from '../../card.interface';

export const CrystalInfuserEnchantment: DeathrattleEnchantmentEffectCard = {
	cardIds: [
		CardIds.CrystalInfuser_InfusedEnchantment_BG31_325_Ge,
		CardIds.CrystalInfuser_InfusedEnchantment_BG31_325_Ge,
	],
	deathrattleEffectEnchantmentEffect: (enchantment: { cardId: string }, input: DeathrattleTriggeredInput) => {
		const mult = enchantment.cardId === CardIds.CrystalInfuser_InfusedEnchantment_BG31_325_Ge ? 1 : 2;
		const cards = [];
		for (let i = 0; i < 2 * mult; i++) {
			cards.push(CardIds.BloodGem);
		}
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cards, input.gameState);
	},
};
