import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { CardIds } from '../services/card-ids';
import { copyEntity } from '../utils';
import { removeAurasFromSelf } from './add-minion-to-board';
import { spawnEntities } from './deathrattle-spawns';
import { FullGameState } from './internal-game-state';
import { performEntitySpawns } from './spawns';
import { setEntityStats } from './stats';

export const handleSplittingImage = (
	defendingEntity: BoardEntity,
	defendingBoard: BoardEntity[],
	defendingPlayerEntity: BgsPlayerEntity,
	attackerBoard: BoardEntity[],
	attackerHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	const copy: BoardEntity = {
		...defendingEntity,
		attack: 3,
		health: 3,
		maxHealth: 3,
	};
	const candidateEntities = spawnEntities(
		defendingEntity.cardId,
		1,
		defendingBoard,
		defendingPlayerEntity,
		attackerBoard,
		attackerHero,
		gameState,
		defendingEntity.friendly,
		false,
		false,
		true,
		copy,
	);
	const indexFromRight = defendingBoard.length - (defendingBoard.indexOf(defendingEntity) + 1);
	performEntitySpawns(
		candidateEntities,
		defendingBoard,
		defendingPlayerEntity,
		defendingEntity,
		indexFromRight,
		attackerBoard,
		attackerHero,
		gameState,
	);
};

export const handlePackTactics = (
	defendingEntity: BoardEntity,
	defendingBoard: BoardEntity[],
	defendingPlayerEntity: BgsPlayerEntity,
	attackerBoard: BoardEntity[],
	attackerHero: BgsPlayerEntity,
	gameState: FullGameState,
	secretCardId: string,
): void => {
	const copy: BoardEntity = copyEntity(defendingEntity);
	removeAurasFromSelf(copy, defendingBoard, defendingPlayerEntity, gameState);
	const candidateEntities = spawnEntities(
		copy.cardId,
		1,
		defendingBoard,
		defendingPlayerEntity,
		attackerBoard,
		attackerHero,
		gameState,
		defendingEntity.friendly,
		false,
		false,
		true,
		copy,
	);
	const indexFromRight = defendingBoard.length - (defendingBoard.indexOf(defendingEntity) + 1);
	const spawned = performEntitySpawns(
		candidateEntities,
		defendingBoard,
		defendingPlayerEntity,
		defendingEntity,
		indexFromRight,
		attackerBoard,
		attackerHero,
		gameState,
	);
	spawned.forEach((e) => {
		// Might be a HS bug
		// 33.6.2 https://replays.firestoneapp.com/?reviewId=06e89a29-8f63-4c55-bdac-d908ed6e5857&turn=9&action=1
		e.hasAttacked = defendingEntity.hasAttacked;
	});
	if (secretCardId === CardIds.PackTactics_TB_Bacon_Secrets_15) {
		spawned.forEach((e) => setEntityStats(e, 3, 3, defendingBoard, defendingPlayerEntity, gameState));
	}
};

export const handleSnakeTrap = (
	defendingEntity: BoardEntity,
	defendingBoard: BoardEntity[],
	defendingPlayerEntity: BgsPlayerEntity,
	attackerBoard: BoardEntity[],
	attackerHero: BgsPlayerEntity,
	gameState: FullGameState,
): void => {
	const candidateEntities: readonly BoardEntity[] = spawnEntities(
		CardIds.SnakeTrap_SnakeLegacyToken,
		3,
		defendingBoard,
		defendingPlayerEntity,
		attackerBoard,
		attackerHero,
		gameState,
		defendingEntity.friendly,
		false,
	);
	performEntitySpawns(
		candidateEntities,
		defendingBoard,
		defendingPlayerEntity,
		defendingEntity,
		0,
		attackerBoard,
		attackerHero,
		gameState,
	);
};

export const handleVenomstrikeTrap = (
	defendingEntity: BoardEntity,
	defendingBoard: BoardEntity[],
	defendingPlayerEntity: BgsPlayerEntity,
	attackerBoard: BoardEntity[],
	attackerHero: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	const candidateEntities: readonly BoardEntity[] = spawnEntities(
		CardIds.EmperorCobraLegacy_BG_EX1_170,
		1,
		defendingBoard,
		defendingPlayerEntity,
		attackerBoard,
		attackerHero,
		gameState,
		defendingEntity.friendly,
		false,
	);
	const spawns = performEntitySpawns(
		candidateEntities,
		defendingBoard,
		defendingPlayerEntity,
		defendingEntity,
		0,
		attackerBoard,
		attackerHero,
		gameState,
	);
	return spawns;
};
