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
	let newDefendingEntity;
	[newDefendingEntity, defendingBoard] = bumpEntities(
		defendingEntity,
		fakeAttacker,
		defendingBoard,
		allCards,
		sharedState,
	);
	const defendingEntityIndex = defendingBoard.map(entity => entity.entityId).indexOf(newDefendingEntity.entityId);
	const updatedBoard = [...defendingBoard];
	updatedBoard[defendingEntityIndex] = newDefendingEntity;
	// console.log('[start of combat] newDefendingEntity', newDefendingEntity);
	// TODO: loop until things are stabilized
	[defendingBoard, opponentBoard] = processMinionDeath(
		updatedBoard,
		// [newDefendingEntity],
		opponentBoard,
		// fakeAttacker,
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

export const bumpEntities = (
	entity: BoardEntity,
	bumpInto: BoardEntity,
	entityBoard: readonly BoardEntity[],
	allCards: AllCardsService,
	sharedState: SharedState,
): [BoardEntity, readonly BoardEntity[]] => {
	// No attack has no impact
	if (bumpInto.attack === 0) {
		return [entity, entityBoard];
	}
	if (entity.divineShield) {
		return [
			{
				...entity,
				divineShield: false,
			} as BoardEntity,
			entityBoard,
		];
	}
	const updatedEntityBoard = [...entityBoard];
	if (entity.cardId === CardIds.Collectible.Warlock.ImpGangBoss && updatedEntityBoard.length < 7) {
		const index = updatedEntityBoard.map(e => e.entityId).indexOf(entity.entityId);
		updatedEntityBoard.splice(
			index,
			0,
			buildBoardEntity(
				CardIds.NonCollectible.Warlock.ImpGangBoss_ImpToken,
				allCards,
				sharedState.currentEntityId++,
			),
		);
	}
	if (entity.cardId === CardIds.NonCollectible.Warlock.ImpGangBossTavernBrawl && updatedEntityBoard.length < 7) {
		const index = updatedEntityBoard.map(e => e.entityId).indexOf(entity.entityId);
		updatedEntityBoard.splice(
			index,
			0,
			buildBoardEntity(
				CardIds.NonCollectible.Warlock.ImpGangBoss_ImpTokenTavernBrawl,
				allCards,
				sharedState.currentEntityId++,
			),
		);
	}
	return [
		{
			...entity,
			health: entity.health - bumpInto.attack,
			lastAffectedByEntity: { ...bumpInto },
		} as BoardEntity,
		updatedEntityBoard,
	];
};

export const processMinionDeath = (
	board1: readonly BoardEntity[],
	board2: readonly BoardEntity[],
	// killer: BoardEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
): [readonly BoardEntity[], readonly BoardEntity[]] => {
	const [board1WithRemovedMinions, deadMinionIndexes1, deadEntities1] = makeMinionsDie(board1);
	const [board2WithRemovedMinions, deadMinionIndexes2, deadEntities2] = makeMinionsDie(board2);
	// No death to process, we can return
	if (deadEntities1.length === 0 && deadEntities2.length === 0) {
		return [board1, board2];
	}
	board1 = board1WithRemovedMinions;
	board2 = board2WithRemovedMinions;

	// Now proceed to trigger all deathrattle effects on baord1
	// I don't know how accurate this is. I assume that normally the deathrattles could trigger
	// alternating between board1 and board2 based on the play order
	// For now I'll trigger everything from board1 first, then everything from board 2
	// It might not be fully accurate, but is probably a good first approximation
	[board1, board2] = handleDeathsForFirstBoard(
		board1,
		board2,
		deadMinionIndexes1,
		deadEntities1,
		allCards,
		cardsData,
		sharedState,
	);
	// Now handle the other board's deathrattles
	[board2, board1] = handleDeathsForFirstBoard(
		board2,
		board1,
		deadMinionIndexes2,
		deadEntities2,
		allCards,
		cardsData,
		sharedState,
	);
	console.log('board from processMinionDeath', board1, board2);
	// Make sure we only return when there are no more deaths to process
	// FIXME: this will propagate the killer between rounds, which is incorrect. For instance,
	// if a dragon kills a Ghoul, then the Ghoul's deathrattle kills a Kaboom, the killer should
	// now be the ghoul. Then if the Kaboom kills someone, the killer should again change. You could
	// also have multiple killers, which is not taken into account here.
	// The current assumption is that it's a suffienctly fringe case to not matter too much
	return processMinionDeath(board1, board2, allCards, cardsData, sharedState);
	// return [boardWithMaybeDeadMinions, opponentBoard];
};

const handleDeathsForFirstBoard = (
	firstBoard: readonly BoardEntity[],
	otherBoard: readonly BoardEntity[],
	deadMinionIndexes: readonly number[],
	deadEntities: readonly BoardEntity[],
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
): [readonly BoardEntity[], readonly BoardEntity[]] => {
	for (let i = 0; i < deadMinionIndexes.length; i++) {
		const entity = deadEntities[i];
		const index = deadMinionIndexes[i];
		if (entity.health <= 0) {
			[firstBoard, otherBoard] = buildBoardAfterDeathrattleSpawns(
				firstBoard,
				entity,
				index,
				otherBoard,
				// killer,
				allCards,
				cardsData,
				sharedState,
			);
			console.log('board after dr spawns', entity, firstBoard, otherBoard);
		} else if (firstBoard.length > 0) {
			const newBoardD = [...firstBoard];
			newBoardD.splice(index, 1, entity);
			firstBoard = newBoardD;
			console.log('board after minions fight without death', entity, firstBoard, otherBoard);
		}
	}
	return [firstBoard, otherBoard];
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
	deadEntity: BoardEntity,
	// killer: BoardEntity,
	allCards: AllCardsService,
): [readonly BoardEntity[], readonly BoardEntity[]] => {
	console.log('handling kill effects', boardWithKilledMinion, killerBoard);
	if (
		!deadEntity.lastAffectedByEntity ||
		allCards.getCard(deadEntity.lastAffectedByEntity.cardId).race !== 'DRAGON'
	) {
		return [boardWithKilledMinion, killerBoard];
	}
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
};

const buildBoardAfterDeathrattleSpawns = (
	boardWithKilledMinion: readonly BoardEntity[],
	deadEntity: BoardEntity,
	deadMinionIndex: number,
	opponentBoard: readonly BoardEntity[],
	// killer: BoardEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
): [readonly BoardEntity[], readonly BoardEntity[]] => {
	[boardWithKilledMinion, opponentBoard] = handleKillEffects(
		boardWithKilledMinion,
		opponentBoard,
		deadEntity,
		allCards,
	);
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
