import { BgsPlayerEntity } from '../../bgs-player-entity';
import { BoardEntity } from '../../board-entity';
import { FullGameState } from '../internal-game-state';
import { handleSummonsWhenSpace } from '../summon-when-space';
import { performStartOfCombatAction } from './soc-action-processor';
import { SoCInput } from './start-of-combat-input';

export const handleStartOfCombatQuestRewards = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	gameState: FullGameState,
): number => {
	if (Math.random() < 0.5) {
		currentAttacker = handleStartOfCombatQuestRewardsForPlayer({
			playerEntity,
			playerBoard,
			opponentEntity,
			opponentBoard,
			currentAttacker,
			gameState,
			playerIsFriendly: true,
		});
		currentAttacker = handleStartOfCombatQuestRewardsForPlayer({
			opponentEntity,
			opponentBoard,
			playerEntity,
			playerBoard,
			currentAttacker,
			gameState,
			playerIsFriendly: false,
		});
	} else {
		currentAttacker = handleStartOfCombatQuestRewardsForPlayer({
			opponentEntity,
			opponentBoard,
			playerEntity,
			playerBoard,
			currentAttacker,
			gameState,
			playerIsFriendly: false,
		});
		currentAttacker = handleStartOfCombatQuestRewardsForPlayer({
			playerEntity,
			playerBoard,
			opponentEntity,
			opponentBoard,
			currentAttacker,
			gameState,
			playerIsFriendly: true,
		});
	}

	handleSummonsWhenSpace(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	return currentAttacker;
};

const handleStartOfCombatQuestRewardsForPlayer = (input: SoCInput): number => {
	if (input.playerEntity.startOfCombatDone) {
		return input.currentAttacker;
	}

	for (const reward of input.playerEntity.questRewards) {
		performStartOfCombatAction(reward, null, input);
	}

	return input.currentAttacker;
};