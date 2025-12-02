import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { simplifiedSpawnEntities } from '../../../simulation/deathrattle-spawns';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedTideRazor: DeathrattleSpawnCard = {
	cardIds: [CardIds.TimewarpedTideRazor_BG34_Giant_328, CardIds.TimewarpedTideRazor_BG34_Giant_328_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === CardIds.TimewarpedTideRazor_BG34_Giant_328_G ? 2 : 1;
		const spawnedEntities: BoardEntity[] = [];
		for (let i = 0; i < 3 * mult; i++) {
			const cardToAdd = input.gameState.cardsData.getRandomMinionForTribe(
				Race.PIRATE,
				input.boardWithDeadEntityHero.tavernTier ?? 5,
			);
			const spawned = simplifiedSpawnEntities(cardToAdd, 1, input);
			spawnedEntities.push(...spawned);
			addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, [cardToAdd], input.gameState);
		}
		return spawnedEntities;
	},
};
