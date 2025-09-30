import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleSpawnCard } from '../../card.interface';

export const DivineSparkbot: DeathrattleSpawnCard = {
	cardIds: [CardIds.DivineSparkbot_BG33_809, CardIds.DivineSparkbot_BG33_809_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.DivineSparkbot_BG33_809_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.Sanctify_BG33_817);
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
		return [];
	},
};
