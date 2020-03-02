import { BoardEntity } from '../board-entity';
import { AllCardsService } from '../cards/cards';
import { CardsData } from '../cards/cards-data';
import { PlayerEntity } from '../player-entity';
import { SingleSimulationResult } from '../single-simulation-result';
import { buildBoardEntity } from '../utils';
import { applyAuras, removeAuras } from './auras';
import { spawnEntitiesFromDeathrattle, spawnEntitiesFromEnchantments } from './deathrattles';
import { SharedState } from './shared-state';

// New simulator should be instantiated for each match
// TODO: implement all the cards, including:
// - Start of turn effects
// - Native deathrattles
// - Deathrattles received via enchantments
// - Pre-attack effects, like the dragon doubling its attack
// - Pre-attack effects on other cards, like the one that gets +1 attack when another minion attacks
// - Cleaves
// - Procs on minion death (like Junkbot)
export class Simulator {
	private currentAttacker: number;
	private lastPlayerAttackerEntityId: number;
	private lastOpponentAttackerEntityId: number;
	private sharedState: SharedState;

	// It should come already initialized
	constructor(private readonly allCards: AllCardsService, private readonly spawns: CardsData) {
		this.sharedState = new SharedState();
	}

	// Here we suppose that the BoardEntity only contain at most the enchantments that are linked
	// to auras (so we probably should hand-filter that, since there are actually few auras)
	public simulateSingleBattle(
		playerBoard: readonly BoardEntity[],
		playerEntity: PlayerEntity,
		opponentBoard: readonly BoardEntity[],
		opponentEntity: PlayerEntity,
	): SingleSimulationResult {
		this.sharedState.currentEntityId =
			Math.max(...playerBoard.map(entity => entity.entityId), ...opponentBoard.map(entity => entity.entityId)) +
			1;
		// let boards = [playerBoard, opponentBoard];
		// console.log('boards', boards);
		this.currentAttacker =
			playerBoard.length > opponentBoard.length
				? 0
				: opponentBoard.length > playerBoard.length
				? 1
				: Math.round(Math.random());
		console.log('starting player', this.currentAttacker);
		while (playerBoard.length > 0 && opponentBoard.length > 0) {
			console.log('starting round', playerBoard.length, opponentBoard.length, playerBoard, opponentBoard);
			if (this.currentAttacker === 0) {
				[playerBoard, opponentBoard] = this.simulateAttack(
					playerBoard,
					opponentBoard,
					this.lastPlayerAttackerEntityId,
				);
			} else {
				[opponentBoard, playerBoard] = this.simulateAttack(
					opponentBoard,
					playerBoard,
					this.lastOpponentAttackerEntityId,
				);
			}
			this.currentAttacker = (this.currentAttacker + 1) % 2;
		}
		console.log('battle over', playerBoard, opponentBoard);
		if (playerBoard.length === 0 && opponentBoard.length === 0) {
			return {
				result: 'tied',
			} as SingleSimulationResult;
		}
		if (playerBoard.length === 0) {
			return {
				result: 'lost',
				damageDealt: this.buildBoardTotalDamage(opponentBoard) + opponentEntity.tavernTier,
			};
		}
		return {
			result: 'won',
			damageDealt: this.buildBoardTotalDamage(playerBoard) + playerEntity.tavernTier,
		};
	}

	private simulateAttack(
		attackingBoard: readonly BoardEntity[],
		defendingBoard: readonly BoardEntity[],
		lastAttackerEntityId: number,
	): [readonly BoardEntity[], readonly BoardEntity[]] {
		// TODO: handle windfury
		if (attackingBoard.length === 0 || defendingBoard.length === 0) {
			return [attackingBoard, defendingBoard];
		}
		attackingBoard = applyAuras(attackingBoard, this.spawns);
		defendingBoard = applyAuras(defendingBoard, this.spawns);

		const attackingEntity: BoardEntity = this.getAttackingEntity(attackingBoard, lastAttackerEntityId);
		if (attackingEntity) {
			const defendingEntity: BoardEntity = this.getDefendingEntity(defendingBoard);
			console.log('battling between', attackingEntity, defendingEntity);
			[attackingBoard, defendingBoard] = this.performAttack(
				attackingEntity,
				defendingEntity,
				attackingBoard,
				defendingBoard,
			);
			console.log('attacking board', attackingBoard, 'defending board', defendingBoard);
		}
		// return [[], []];
		console.log('before removing auras', attackingBoard, defendingBoard);
		attackingBoard = removeAuras(attackingBoard, this.spawns);
		defendingBoard = removeAuras(defendingBoard, this.spawns);
		console.log('after removing auras', attackingBoard, defendingBoard);
		return [attackingBoard, defendingBoard];
	}

	private performAttack(
		attackingEntity: BoardEntity,
		defendingEntity: BoardEntity,
		attackingBoard: readonly BoardEntity[],
		defendingBoard: readonly BoardEntity[],
	): [readonly BoardEntity[], readonly BoardEntity[]] {
		const newAttackingEntity = this.bumpEntities(attackingEntity, defendingEntity);
		const newDefendingEntity = this.bumpEntities(defendingEntity, attackingEntity);
		const updatedDefenders = [newDefendingEntity];
		// Cleave
		if (attackingEntity.cleave) {
			const neighbours: readonly BoardEntity[] = this.getNeighbours(defendingBoard, defendingEntity);
			updatedDefenders.push(...neighbours.map(entity => this.bumpEntities(entity, attackingEntity)));
		}
		// Approximate the play order
		updatedDefenders.sort((a, b) => a.entityId - b.entityId);

		attackingBoard = this.processMinionDeath(attackingBoard, [newAttackingEntity]);
		// if (newAttackingEntity.health <= 0) {
		// 	console.log('newAttackingEntity died', newAttackingEntity);
		// 	attackingBoard = this.processMinionDeath(attackingBoard, newAttackingEntity);
		// } else {
		// 	const attackerIndex: number = attackingBoard
		// 		.map(entity => entity.entityId)
		// 		.indexOf(newAttackingEntity.entityId);
		// 	const newBoardA = [...attackingBoard];
		// 	newBoardA.splice(attackerIndex, 1, newAttackingEntity);
		// 	attackingBoard = newBoardA;
		// }
		// We have to first remove all the minions, so that there is room for the deathrattles to proc
		defendingBoard = this.processMinionDeath(defendingBoard, updatedDefenders);
		// let defenderIndexes: number[];
		// [defendingBoard, defenderIndexes] = this.makeMinionsDie(defendingBoard, updatedDefenders);

		// for (let i = 0; i < defenderIndexes.length; i++) {
		// 	const defender = updatedDefenders[i];
		// 	const index = defenderIndexes[i];
		// 	if (defender.health <= 0) {
		// 		defendingBoard = this.buildBoardAfterDeathrattleSpawns(defendingBoard, defender, index);
		// 	} else {
		// 		// const defenderIndex: number = defendingBoard
		// 		// 	.map(entity => entity.entityId)
		// 		// 	.indexOf(defender.entityId);
		// 		const newBoardD = [...defendingBoard];
		// 		newBoardD.splice(index, 1, defender);
		// 		defendingBoard = newBoardD;
		// 	}
		// }
		return [attackingBoard, defendingBoard];
	}

	private getNeighbours(board: readonly BoardEntity[], entity: BoardEntity): readonly BoardEntity[] {
		const index = board.map(e => e.entityId).indexOf(entity.entityId);
		const neighbours = [];
		if (index - 1 >= 0) {
			neighbours.push(board[index - 1]);
		}
		neighbours.push(entity);
		if (index + 1 < board.length) {
			neighbours.push(board[index + 1]);
		}
		return neighbours;
	}

	private processMinionDeath(
		board: readonly BoardEntity[],
		entities: readonly BoardEntity[],
	): readonly BoardEntity[] {
		let indexes: number[];
		[board, indexes] = this.makeMinionsDie(board, entities);

		for (let i = 0; i < indexes.length; i++) {
			const entity = entities[i];
			const index = indexes[i];
			if (entity.health <= 0) {
				board = this.buildBoardAfterDeathrattleSpawns(board, entity, index);
			} else {
				// const defenderIndex: number = defendingBoard
				// 	.map(entity => entity.entityId)
				// 	.indexOf(defender.entityId);
				const newBoardD = [...board];
				newBoardD.splice(index, 1, entity);
				board = newBoardD;
			}
		}
		return board;
	}

	private makeMinionsDie(
		defendingBoard: readonly BoardEntity[],
		updatedDefenders: readonly BoardEntity[],
	): [readonly BoardEntity[], number[]] {
		const indexes = [];
		let boardCopy = [...defendingBoard];
		for (const defender of updatedDefenders) {
			const index = boardCopy.map(entity => entity.entityId).indexOf(defender.entityId);
			indexes.push(index);
			if (defender.health <= 0) {
				boardCopy.splice(index, 1);
			}
		}
		return [boardCopy, indexes];
	}

	private buildBoardAfterDeathrattleSpawns(
		board: readonly BoardEntity[],
		deadEntity: BoardEntity,
		deadMinionIndex: number,
	): readonly BoardEntity[] {
		const entitiesFromNativeDeathrattle: readonly BoardEntity[] = spawnEntitiesFromDeathrattle(
			deadEntity,
			this.allCards,
			this.spawns,
			this.sharedState,
		);
		console.log('entitiesFromNativeDeathrattle', entitiesFromNativeDeathrattle);
		const entitiesFromReborn: readonly BoardEntity[] = deadEntity.reborn
			? [
					{
						...buildBoardEntity(deadEntity.cardId, this.allCards, this.sharedState.currentEntityId++),
						health: 1,
					} as BoardEntity,
			  ]
			: [];
		const entitiesFromEnchantments: readonly BoardEntity[] = spawnEntitiesFromEnchantments(
			deadEntity,
			this.allCards,
			this.spawns,
			this.sharedState,
		);
		const candidateEntities: readonly BoardEntity[] = [
			...entitiesFromNativeDeathrattle,
			...entitiesFromReborn,
			...entitiesFromEnchantments,
		];
		console.log('candidateEntities', candidateEntities);
		const roomToSpawn: number = 7 - board.length;
		const spawnedEntities: readonly BoardEntity[] = candidateEntities.slice(0, roomToSpawn);
		console.log('spawnedEntities', spawnedEntities);
		// const deadMinionIndex: number = board.map(entity => entity.entityId).indexOf(deadEntity.entityId);
		// console.log('deadMinionIndex', deadMinionIndex, board);
		const newBoard = [...board];
		// Minion has already been removed from the board in the previous step
		newBoard.splice(deadMinionIndex, 0, ...spawnedEntities);
		console.log('newBoard', newBoard);
		return newBoard;
	}

	private bumpEntities(entity: BoardEntity, bumpInto: BoardEntity) {
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
	}

	private getAttackingEntity(attackingBoard: readonly BoardEntity[], lastAttackerEntityId: number): BoardEntity {
		const validAttackers = attackingBoard.filter(entity => entity.attack > 0);
		if (validAttackers.length === 0) {
			return null;
		}
		let attackingEntity = validAttackers[0];
		let minNumberOfAttacks: number = attackingEntity.attacksPerformed;
		for (const entity of validAttackers) {
			if (entity.attacksPerformed < minNumberOfAttacks) {
				attackingEntity = entity;
				minNumberOfAttacks = entity.attacksPerformed;
			}
		}
		return attackingEntity;
	}

	private getDefendingEntity(defendingBoard: readonly BoardEntity[]): BoardEntity {
		const taunts = defendingBoard.filter(entity => entity.taunt);
		const possibleDefenders = taunts.length > 0 ? taunts : defendingBoard;
		return possibleDefenders[Math.floor(Math.random() * possibleDefenders.length)];
	}

	private buildBoardTotalDamage(playerBoard: readonly BoardEntity[]) {
		return playerBoard
			.map(entity => this.allCards.getCard(entity.cardId).techLevel || 1)
			.reduce((a, b) => a + b, 0);
	}
}
