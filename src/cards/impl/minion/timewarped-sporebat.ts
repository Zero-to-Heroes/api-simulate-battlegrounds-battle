import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedSporebat: DeathrattleSpawnCard = {
	cardIds: [CardIds.TimewarpedSporebat_BG34_Giant_582, CardIds.TimewarpedSporebat_BG34_Giant_582_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.TimewarpedSporebat_BG34_Giant_582_G ? 2 : 1;
		const cardsToAdd = [];
		for (let i = 0; i < mult; i++) {
			const cardToAdd = input.gameState.cardsData.getRandomTavernSpell();
			cardsToAdd.push(cardToAdd);
		}
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
		return [];
	},
};
