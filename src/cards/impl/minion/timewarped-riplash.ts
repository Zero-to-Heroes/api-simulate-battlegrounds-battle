import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedRiplash: DeathrattleSpawnCard = {
	cardIds: [CardIds.TimewarpedRiplash_BG34_Giant_325, CardIds.TimewarpedRiplash_BG34_Giant_325_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.TimewarpedRiplash_BG34_Giant_325_G ? 2 : 1;
		const cardsToAdd = Array(mult).map(() => input.gameState.cardsData.getRandomTavernSpell());
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
		return [];
	},
};
