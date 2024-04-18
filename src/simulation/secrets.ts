import { CardIds } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
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
		gameState.allCards,
		gameState.cardsData,
		gameState.sharedState,
		gameState.spectator,
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
): void => {
	const candidateEntities = spawnEntities(
		defendingEntity.cardId,
		1,
		defendingBoard,
		defendingPlayerEntity,
		attackerBoard,
		attackerHero,
		gameState.allCards,
		gameState.cardsData,
		gameState.sharedState,
		gameState.spectator,
		defendingEntity.friendly,
		false,
		false,
		true,
		{ ...defendingEntity },
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
	spawned.forEach((e) => setEntityStats(e, 3, 3, defendingBoard, defendingPlayerEntity, gameState));
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
		gameState.allCards,
		gameState.cardsData,
		gameState.sharedState,
		gameState.spectator,
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
): void => {
	const candidateEntities: readonly BoardEntity[] = spawnEntities(
		CardIds.EmperorCobraLegacy_BG_EX1_170,
		1,
		defendingBoard,
		defendingPlayerEntity,
		attackerBoard,
		attackerHero,
		gameState.allCards,
		gameState.cardsData,
		gameState.sharedState,
		gameState.spectator,
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
