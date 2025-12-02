import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedPillager: DeathrattleSpawnCard = {
	cardIds: [CardIds.TimewarpedPillager_BG34_Giant_204, CardIds.TimewarpedPillager_BG34_Giant_204_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.TimewarpedPillager_BG34_Giant_204_G ? 2 : 1;
		const coins = Array(mult).fill(CardIds.TavernCoin_BG28_810);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, coins, input.gameState);
		return [];
	},
};
