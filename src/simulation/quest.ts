import { CardIds } from '../services/card-ids';
import { BgsPlayerEntity, BgsQuestEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { FullGameState } from './internal-game-state';

export const onQuestProgressUpdated = (
	playerEntity: BgsPlayerEntity,
	quest: BgsQuestEntity,
	board: BoardEntity[],
	gameState: FullGameState,
) => {
	quest.ProgressCurrent++;
	if (quest.ProgressCurrent < quest.ProgressTotal) {
		return;
	}

	const rewardCardId = gameState.allCards.getCard(quest.RewardDbfId).id;
	playerEntity.questRewards.push(rewardCardId);
	playerEntity.questRewardEntities.push({
		cardId: rewardCardId,
		entityId: gameState.sharedState.currentEntityId++,
		avengeDefault: gameState.cardsData.avengeValue(rewardCardId),
		avengeCurrent: gameState.cardsData.avengeValue(rewardCardId),
		scriptDataNum1: gameState.cardsData.defaultScriptDataNum(rewardCardId),
	});

	// Remove the quest from the list of quests
	playerEntity.questEntities = playerEntity.questEntities.filter((q) => q.CardId !== quest.CardId);

	updateStateAfterQuestCreated(rewardCardId, board, playerEntity, gameState);
};

const updateStateAfterQuestCreated = (
	rewardCardId: string,
	board: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	switch (rewardCardId) {
		case CardIds.TheSmokingGun:
			board.forEach((e) => {
				e.attack += 4;
			});
			break;
		default:
			break;
	}
};
