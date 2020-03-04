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
	damageSource: BoardEntity,
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
		...damageSource,
		attack: damage,
	} as BoardEntity;
	const newDefendingEntity = bumpEntities(defendingEntity, fakeAttacker);
	const defendingEntityIndex = defendingBoard.map(entity => entity.entityId).indexOf(newDefendingEntity.entityId);
	const updatedBoard = [...defendingBoard];
	updatedBoard[defendingEntityIndex] = newDefendingEntity;
	// console.log('[start of combat] newDefendingEntity', newDefendingEntity);
	// TODO: loop until things are stabilized
	[defendingBoard, opponentBoard] = processMinionDeath(
		updatedBoard,
		// [newDefendingEntity],
		opponentBoard,
		fakeAttacker,
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
	boardWithMaybeDeadMinions: readonly BoardEntity[],
	opponentBoard: readonly BoardEntity[],
	killer: BoardEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
): [readonly BoardEntity[], readonly BoardEntity[]] => {
	const [boardWithRemovedMinions, deadMinionIndexes, deadEntities] = makeMinionsDie(boardWithMaybeDeadMinions);
	if (deadEntities.length === 0) {
		return [boardWithMaybeDeadMinions, opponentBoard];
	}
	boardWithMaybeDeadMinions = boardWithRemovedMinions;
	for (let i = 0; i < deadMinionIndexes.length; i++) {
		const entity = deadEntities[i];
		const index = deadMinionIndexes[i];
		if (entity.health <= 0) {
			[boardWithMaybeDeadMinions, opponentBoard] = buildBoardAfterDeathrattleSpawns(
				boardWithMaybeDeadMinions,
				entity,
				index,
				opponentBoard,
				killer,
				allCards,
				cardsData,
				sharedState,
			);
			console.log('board after dr spawns', entity, boardWithMaybeDeadMinions, opponentBoard);
		} else if (boardWithMaybeDeadMinions.length > 0) {
			const newBoardD = [...boardWithMaybeDeadMinions];
			newBoardD.splice(index, 1, entity);
			boardWithMaybeDeadMinions = newBoardD;
			console.log('board after minions fight without death', entity, boardWithMaybeDeadMinions, opponentBoard);
		}
	}
	console.log('board from processMinionDeath', boardWithMaybeDeadMinions, opponentBoard);
	return [boardWithMaybeDeadMinions, opponentBoard];
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
	board: readonly BoardEntity[],
	// updatedDefenders: readonly BoardEntity[],
): [readonly BoardEntity[], number[], readonly BoardEntity[]] => {
	const deadMinionIndexes: number[] = [];
	const deadEntities: BoardEntity[] = [];
	const boardCopy = [...board];
	for (let i = 0; i < board.length; i++) {
		const index = boardCopy.map(entity => entity.entityId).indexOf(board[i].entityId);
		if (board[i].health <= 0) {
			deadMinionIndexes.push(i);
			deadEntities.push(board[i]);
			boardCopy.splice(index, 1);
		}
	}
	return [boardCopy, deadMinionIndexes, deadEntities];

	// const indexes = [];
	// const boardCopy = [...board];
	// for (const defender of updatedDefenders) {
	// 	const index = boardCopy.map(entity => entity.entityId).indexOf(defender.entityId);
	// 	indexes.push(index);
	// 	if (defender.health <= 0) {
	// 		boardCopy.splice(index, 1);
	// 	}
	// }
	// return [boardCopy, indexes];
};

const handleKillEffects = (
	boardWithKilledMinion: readonly BoardEntity[],
	killerBoard: readonly BoardEntity[],
	killer: BoardEntity,
	allCards: AllCardsService,
): [readonly BoardEntity[], readonly BoardEntity[]] => {
	if (allCards.getCard(killer.cardId).race === 'DRAGON') {
		return [
			boardWithKilledMinion,
			killerBoard.map(entity => {
				if (entity.cardId === CardIds.NonCollectible.Neutral.WaxriderTogwaggle) {
					return {
						...entity,
						attack: entity.attack + 2,
						health: entity.health + 2,
					};
				} else if (entity.cardId === CardIds.NonCollectible.Neutral.WaxriderTogwaggleTavernBrawl) {
					return {
						...entity,
						attack: entity.attack + 4,
						health: entity.health + 4,
					};
				}
				return entity;
			}),
		];
	}
	return [boardWithKilledMinion, killerBoard];
};

const buildBoardAfterDeathrattleSpawns = (
	boardWithKilledMinion: readonly BoardEntity[],
	deadEntity: BoardEntity,
	deadMinionIndex: number,
	opponentBoard: readonly BoardEntity[],
	killer: BoardEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
): [readonly BoardEntity[], readonly BoardEntity[]] => {
	console.log('handling kill effects', boardWithKilledMinion, opponentBoard, killer);
	[boardWithKilledMinion, opponentBoard] = handleKillEffects(boardWithKilledMinion, opponentBoard, killer, allCards);
	[boardWithKilledMinion, opponentBoard] = handleDeathrattleEffects(
		boardWithKilledMinion,
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
	const roomToSpawn: number = 7 - boardWithKilledMinion.length;
	const spawnedEntities: readonly BoardEntity[] = candidateEntities.slice(0, roomToSpawn);
	// console.log('spawnedEntities', spawnedEntities);
	// const deadMinionIndex: number = board.map(entity => entity.entityId).indexOf(deadEntity.entityId);
	// console.log('deadMinionIndex', deadMinionIndex, board);
	const newBoard = [...boardWithKilledMinion];
	// Minion has already been removed from the board in the previous step
	newBoard.splice(deadMinionIndex, 0, ...spawnedEntities);
	const boardAfterMinionSpawnEffects = handleSpawnEffects(newBoard, spawnedEntities, allCards);
	console.log('newBoard', boardAfterMinionSpawnEffects, opponentBoard);
	return [boardAfterMinionSpawnEffects, opponentBoard];
};
