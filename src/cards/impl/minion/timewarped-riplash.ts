import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedRiplash: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.TimewarpedRiplash, TempCardIds.TimewarpedRiplash_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedRiplash_G ? 2 : 1;
		const cardsToAdd = Array(mult).map(() => input.gameState.cardsData.getRandomTavernSpell());
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
		return [];
	},
};
