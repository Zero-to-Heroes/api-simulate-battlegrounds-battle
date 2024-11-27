import { CardIds } from '@firestone-hs/reference-data';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleEnchantmentEffectCard } from '../../card.interface';

export const CrystalInfuserEnchantment: DeathrattleEnchantmentEffectCard = {
	cardIds: [TempCardIds.CrystalInfuserEnchantment, TempCardIds.CrystalInfuserEnchantment_G],
	deathrattleEnchantmentEffect: (enchantment: { cardId: string }, input: DeathrattleTriggeredInput) => {
		const mult = enchantment.cardId === TempCardIds.CrystalInfuserEnchantment ? 1 : 2;
		const cards = [];
		for (let i = 0; i < 2 * mult; i++) {
			cards.push(CardIds.BloodGem);
		}
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cards, input.gameState);
	},
};
