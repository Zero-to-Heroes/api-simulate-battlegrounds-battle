import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleSpawnCard } from '../../card.interface';

export const GildedGargoyle: DeathrattleSpawnCard = {
	cardIds: [CardIds.GildedGargoyle_BG26_LOOT_534],
	deathrattleSpawn: (enchantment: { cardId: string }, input: DeathrattleTriggeredInput) => {
		const cards = [CardIds.TheCoinCore];
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cards, input.gameState);
		return [];
	},
};
