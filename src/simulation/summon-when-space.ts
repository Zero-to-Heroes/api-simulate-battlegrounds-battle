import { CardIds } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { buildSingleBoardEntity } from '../utils';
import { FullGameState } from './internal-game-state';
import { performEntitySpawns } from './spawns';

export const handleSummonWhenSpace = (
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	if (playerEntity.rapidReanimationMinion) {
		handleRapidReanimationForPlayer(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	}
	if (opponentEntity.rapidReanimationMinion) {
		handleRapidReanimationForPlayer(opponentBoard, opponentEntity, playerBoard, playerEntity, gameState);
	}
	if (playerEntity.questRewards?.includes(CardIds.StableAmalgamation_BG28_Reward_518)) {
		handleStableAmalgamationForPlayer(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	}
	if (opponentEntity.questRewards?.includes(CardIds.StableAmalgamation_BG28_Reward_518)) {
		handleStableAmalgamationForPlayer(opponentBoard, opponentEntity, playerBoard, playerEntity, gameState);
	}
};

const handleStableAmalgamationForPlayer = (
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	const rewardEntity = playerEntity.questRewardEntities.find(
		(entity) => entity.cardId === CardIds.StableAmalgamation_BG28_Reward_518,
	);
	if (rewardEntity && rewardEntity.scriptDataNum1 > 0) {
		while (rewardEntity.scriptDataNum1 > 0) {
			handleSummon(
				playerBoard,
				playerEntity,
				opponentBoard,
				opponentEntity,
				gameState,
				CardIds.StableAmalgamation_TotallyNormalHorseToken_BG28_Reward_518t,
				0,
			);
			rewardEntity.scriptDataNum1--;
		}
	}
};

const handleRapidReanimationForPlayer = (
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	handleSummon(
		playerBoard,
		playerEntity,
		opponentBoard,
		opponentEntity,
		gameState,
		playerEntity.rapidReanimationMinion.cardId,
		Math.min(playerBoard.length, playerEntity.rapidReanimationIndexFromRight ?? 0),
		playerEntity.rapidReanimationMinion,
	);
	playerEntity.rapidReanimationMinion = null;
};

const handleSummon = (
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	gameState: FullGameState,
	cardId: string,
	indexFromRight: number,
	minion: BoardEntity = null,
) => {
	if (playerBoard.length >= 7) {
		return;
	}
	const newMinion = buildSingleBoardEntity(
		cardId,
		playerEntity,
		playerBoard,
		gameState.allCards,
		playerEntity.friendly,
		gameState.sharedState.currentEntityId++,
		false,
		gameState.cardsData,
		gameState.sharedState,
		minion,
		null,
	);
	// Don't reapply auras in this particular case? See https://x.com/ZerotoHeroes_HS/status/1737422727118487808?s=20
	performEntitySpawns(
		[newMinion],
		playerBoard,
		playerEntity,
		playerEntity,
		indexFromRight,
		opponentBoard,
		opponentEntity,
		gameState,
		false,
	);
	gameState.spectator.registerPowerTarget(playerEntity, newMinion, playerBoard, null, null);
};
