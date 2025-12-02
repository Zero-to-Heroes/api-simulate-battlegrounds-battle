import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntitiesWithAddToBoard } from '../../../simulation/deathrattle-spawns';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedNelliesShip: DeathrattleSpawnCard = {
	cardIds: [CardIds.TimewarpedNelliesShipToken_BG34_Giant_074t, CardIds.TimewarpedNelliesShip_BG34_Giant_074t_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const cardsToAdd = [];
		cardsToAdd.push(input.gameState.allCards.getCard(minion.scriptDataNum1).id);
		if (minion.cardId === CardIds.TimewarpedNelliesShip_BG34_Giant_074t_G) {
			cardsToAdd.push(input.gameState.allCards.getCard(minion.scriptDataNum2).id);
		}

		for (const cardToAdd of cardsToAdd) {
			const indexFromRight = input.boardWithDeadEntity.length - input.boardWithDeadEntity.indexOf(minion) - 1;
			simplifiedSpawnEntitiesWithAddToBoard(cardToAdd, 1, input, minion, indexFromRight);
		}
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, cardsToAdd, input.gameState);
		return [];
	},
};
