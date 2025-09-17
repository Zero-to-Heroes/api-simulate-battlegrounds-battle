import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleSpawnCard } from '../../card.interface';

export const CrystalInfuserEnchantment: DeathrattleSpawnCard = {
	cardIds: [
		CardIds.CrystalInfuser_InfusedEnchantment_BG31_325e,
		CardIds.CrystalInfuser_InfusedEnchantment_BG31_325_Ge,
	],
	deathrattleSpawn: (enchantment: { cardId: string }, input: DeathrattleTriggeredInput) => {
		const mult = enchantment.cardId === CardIds.CrystalInfuser_InfusedEnchantment_BG31_325e ? 1 : 2;
		const cards = [];
		for (let i = 0; i < 2 * mult; i++) {
			cards.push(CardIds.BloodGem);
		}
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cards, input.gameState);
		return [];
	},
};
