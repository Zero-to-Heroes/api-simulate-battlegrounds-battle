/* eslint-disable @typescript-eslint/no-use-before-define */
import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../board-entity';
import { AllCardsService } from '../cards/cards';
import { CardsData } from '../cards/cards-data';
import { buildBoardEntity } from '../utils';
import { handleDeathrattleEffects } from './deathrattle-effects';
import { spawnEntitiesFromDeathrattle, spawnEntitiesFromEnchantments } from './deathrattle-spawns';
import { SharedState } from './shared-state';
import { handleSpawnEffects } from './spawn-effect';

export const dealDamageToRandomEnemy = (
	defendingBoard: readonly BoardEntity[],
	damage: number,
	opponentBoard: readonly BoardEntity[],
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
): [readonly BoardEntity[], readonly BoardEntity[]] => {
	if (defendingBoard.length === 0) {
		return [defendingBoard, opponentBoard];
	}
	const defendingEntity: BoardEntity = getDefendingEntity(defendingBoard);
	console.log('defendingEntity', defendingEntity, defendingBoard);
	const fakeAttacker = {
		attack: damage,
	} as BoardEntity;
	const newDefendingEntity = bumpEntities(defendingEntity, fakeAttacker);
	// console.log('[start of combat] newDefendingEntity', newDefendingEntity);
	[defendingBoard, opponentBoard] = processMinionDeath(
		defendingBoard,
		[newDefendingEntity],
		opponentBoard,
		allCards,
		cardsData,
		sharedState,
	);
	// console.log('[start of combat] defendingBoard', defendingBoard);
	return [defendingBoard, opponentBoard];
};

export const getDefendingEntity = (defendingBoard: readonly BoardEntity[]): BoardEntity => {
	const taunts = defendingBoard.filter(entity => entity.taunt);
	const possibleDefenders = taunts.length > 0 ? taunts : defendingBoard;
	return possibleDefenders[Math.floor(Math.random() * possibleDefenders.length)];
};

export const bumpEntities = (entity: BoardEntity, bumpInto: BoardEntity) => {
	// No attack has no impact
	if (bumpInto.attack === 0) {
		return entity;
	}
	if (entity.divineShield) {
		return {
			...entity,
			divineShield: false,
		} as BoardEntity;
	}
	return {
		...entity,
		health: entity.health - bumpInto.attack,
	} as BoardEntity;
};

export const processMinionDeath = (
	board: readonly BoardEntity[],
	entities: readonly BoardEntity[],
	opponentBoard: readonly BoardEntity[],
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
): [readonly BoardEntity[], readonly BoardEntity[]] => {
	let indexes: number[];
	[board, indexes] = makeMinionsDie(board, entities);
	console.log('made minions die', board, indexes);

	for (let i = 0; i < indexes.length; i++) {
		const entity = entities[i];
		const index = indexes[i];
		if (entity.health <= 0) {
			[board, opponentBoard] = buildBoardAfterDeathrattleSpawns(
				board,
				entity,
				index,
				opponentBoard,
				allCards,
				cardsData,
				sharedState,
			);
			console.log('board after dr spawns', entity, board, opponentBoard);
		} else if (board.length > 0) {
			const newBoardD = [...board];
			newBoardD.splice(index, 1, entity);
			board = newBoardD;
			console.log('board after minions fight without death', entity, board, opponentBoard);
		}
	}
	console.log('board from processMinionDeath', board, opponentBoard);
	return [board, opponentBoard];
};

export const applyOnAttackBuffs = (entity: BoardEntity): BoardEntity => {
	if (entity.cardId === CardIds.NonCollectible.Mage.GlyphGuardianBATTLEGROUNDS) {
		return {
			...entity,
			attack: 2 * entity.attack,
		};
	}
	if (entity.cardId === CardIds.NonCollectible.Mage.GlyphGuardianTavernBrawl) {
		return {
			...entity,
			attack: 3 * entity.attack,
		};
	}
	return entity;
};

const makeMinionsDie = (
	defendingBoard: readonly BoardEntity[],
	updatedDefenders: readonly BoardEntity[],
): [readonly BoardEntity[], number[]] => {
	const indexes = [];
	const boardCopy = [...defendingBoard];
	for (const defender of updatedDefenders) {
		const index = boardCopy.map(entity => entity.entityId).indexOf(defender.entityId);
		indexes.push(index);
		if (defender.health <= 0) {
			boardCopy.splice(index, 1);
		}
	}
	return [boardCopy, indexes];
};

const buildBoardAfterDeathrattleSpawns = (
	board: readonly BoardEntity[],
	deadEntity: BoardEntity,
	deadMinionIndex: number,
	opponentBoard: readonly BoardEntity[],
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
): [readonly BoardEntity[], readonly BoardEntity[]] => {
	[board, opponentBoard] = handleDeathrattleEffects(
		board,
		deadEntity,
		deadMinionIndex,
		opponentBoard,
		allCards,
		cardsData,
		sharedState,
	);
	const entitiesFromNativeDeathrattle: readonly BoardEntity[] = spawnEntitiesFromDeathrattle(
		deadEntity,
		allCards,
		cardsData,
		sharedState,
	);
	// console.log('entitiesFromNativeDeathrattle', entitiesFromNativeDeathrattle);
	const entitiesFromReborn: readonly BoardEntity[] = deadEntity.reborn
		? [
				{
					...buildBoardEntity(deadEntity.cardId, allCards, sharedState.currentEntityId++),
					health: 1,
				} as BoardEntity,
		  ]
		: [];
	const entitiesFromEnchantments: readonly BoardEntity[] = spawnEntitiesFromEnchantments(
		deadEntity,
		allCards,
		cardsData,
		sharedState,
	);
	const candidateEntities: readonly BoardEntity[] = [
		...entitiesFromNativeDeathrattle,
		...entitiesFromReborn,
		...entitiesFromEnchantments,
	];
	// console.log('candidateEntities', candidateEntities);
	const roomToSpawn: number = 7 - board.length;
	const spawnedEntities: readonly BoardEntity[] = candidateEntities.slice(0, roomToSpawn);
	// console.log('spawnedEntities', spawnedEntities);
	// const deadMinionIndex: number = board.map(entity => entity.entityId).indexOf(deadEntity.entityId);
	// console.log('deadMinionIndex', deadMinionIndex, board);
	const newBoard = [...board];
	// Minion has already been removed from the board in the previous step
	newBoard.splice(deadMinionIndex, 0, ...spawnedEntities);
	const boardAfterMinionSpawnEffects = handleSpawnEffects(newBoard, spawnedEntities, allCards);
	console.log('newBoard', boardAfterMinionSpawnEffects, opponentBoard);
	return [boardAfterMinionSpawnEffects, opponentBoard];
};
