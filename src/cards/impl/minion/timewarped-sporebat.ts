import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { TempCardIds } from '../../../temp-card-ids';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedSporebat: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.TimewarpedSporebat, TempCardIds.TimewarpedSporebat_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedSporebat_G ? 2 : 1;
		const cardsToAdd = [];
		for (let i = 0; i < mult; i++) {
			const cardToAdd = input.gameState.cardsData.getRandomTavernSpell();
			cardsToAdd.push(cardToAdd);
		}
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
		return [];
	},
};
