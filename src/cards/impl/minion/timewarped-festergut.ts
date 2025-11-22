import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { spawnEntities } from '../../../simulation/deathrattle-spawns';
import { TempCardIds } from '../../../temp-card-ids';
import { buildRandomUndeadCreation } from '../../../utils';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedFestergut: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.TimewarpedFestergut, TempCardIds.TimewarpedFestergut_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedFestergut_G ? 2 : 1;
		const spawnedEntities: BoardEntity[] = [];
		for (let i = 0; i < mult; i++) {
			const randomUndeadCreation = buildRandomUndeadCreation(
				input.boardWithDeadEntityHero,
				input.boardWithDeadEntity,
				input.gameState.allCards,
				input.deadEntity.friendly,
				input.gameState.cardsData,
				input.gameState.sharedState,
			);
			spawnedEntities.push(
				...spawnEntities(
					randomUndeadCreation.cardId,
					1,
					input.boardWithDeadEntity,
					input.boardWithDeadEntityHero,
					input.otherBoard,
					input.otherBoardHero,
					input.gameState,
					input.deadEntity.friendly,
					false,
					false,
					true,
					randomUndeadCreation,
				),
			);
			addCardsInHand(
				input.boardWithDeadEntityHero,
				input.boardWithDeadEntity,
				[randomUndeadCreation],
				input.gameState,
			);
		}
		return spawnedEntities;
	},
};
