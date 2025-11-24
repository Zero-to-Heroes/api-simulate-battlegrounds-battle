import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { TempCardIds } from '../../../temp-card-ids';
import { copyEntity } from '../../../utils';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedRadioStar: DeathrattleSpawnCard = {
	cardIds: [TempCardIds.TimewarpedRadioStar, TempCardIds.TimewarpedRadioStar_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === TempCardIds.TimewarpedRadioStar_G ? 2 : 1;
		const clone = copyEntity(minion.lastAffectedByEntity);
		clone.health = clone.maxHealth;
		const radioEntities = Array(mult).map(() => ({
			...clone,
			entityId: input.gameState.sharedState.currentEntityId++,
		}));
		addCardsInHand(input.boardWithDeadEntityHero, input.boardWithDeadEntity, radioEntities, input.gameState);
		return [];
	},
};
