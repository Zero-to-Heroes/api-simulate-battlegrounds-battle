import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TombPillager: DeathrattleSpawnCard = {
	cardIds: [CardIds.TombPillager_BG_LOE_012],
	deathrattleSpawn: (enchantment: { cardId: string }, input: DeathrattleTriggeredInput) => {
		const cards = [CardIds.TheCoinCore];
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cards, input.gameState);
		return [];
	},
};
