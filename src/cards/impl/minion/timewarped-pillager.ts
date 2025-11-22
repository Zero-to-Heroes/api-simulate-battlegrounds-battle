import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedPillager: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.TimewarpedPillager, TempCardIds.TimewarpedPillager_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedPillager_G ? 2 : 1;
		const coins = Array(mult).fill(CardIds.TavernCoin_BG28_810);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, coins, input.gameState);
		return [];
	},
};
