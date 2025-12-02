import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { DeathrattleTriggeredInput } from '../../../simulation/deathrattle-on-trigger';
import { copyEntity } from '../../../utils';
import { DeathrattleSpawnCard } from '../../card.interface';

export const TimewarpedRadioStar: DeathrattleSpawnCard = {
	cardIds: [CardIds.TimewarpedRadioStar_BG34_Giant_330, CardIds.TimewarpedRadioStar_BG34_Giant_330_G],
	deathrattleSpawn: (minion: BoardEntity, input: DeathrattleTriggeredInput): readonly BoardEntity[] => {
		const mult = minion.cardId === CardIds.TimewarpedRadioStar_BG34_Giant_330_G ? 2 : 1;
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
