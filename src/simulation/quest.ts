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
		avengeDefault: 0,
		avengeCurrent: 0,
		scriptDataNum1: 0,
	});

	// Remove the quest from the list of quests
	playerEntity.questEntities = playerEntity.questEntities.filter((quest) => quest.CardId !== quest.CardId);
};