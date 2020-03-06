import { BoardEntity } from '../board-entity';
import { AllCardsService } from '../cards/cards';
import { CardsData } from '../cards/cards-data';
import { PlayerEntity } from '../player-entity';
import { SingleSimulationResult } from '../single-simulation-result';
import {
	applyOnAttackBuffs,
	bumpEntities,
	dealDamageToRandomEnemy,
	getDefendingEntity,
	processMinionDeath,
} from './attack';
import { applyAuras, removeAuras } from './auras';
import { applyGlobalModifiers, removeGlobalModifiers } from './global-modifiers';
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
		[playerBoard, opponentBoard] = this.handleStartOfCombat(playerBoard, opponentBoard);
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

	// TODO: hero power start of combat
	private handleStartOfCombat(
		playerBoard: readonly BoardEntity[],
		opponentBoard: readonly BoardEntity[],
	): [readonly BoardEntity[], readonly BoardEntity[]] {
		let currentAttacker = Math.round(Math.random());
		// console.log('[start of combat] attacker', currentAttacker);
		const playerAttackers = playerBoard.filter(entity => this.spawns.startOfCombats.indexOf(entity.cardId) !== -1);
		const opponentAttackers = opponentBoard.filter(
			entity => this.spawns.startOfCombats.indexOf(entity.cardId) !== -1,
		);
		// console.log('[start of combat] cazndidates', playerAttackers, opponentAttackers);
		while (playerAttackers.length > 0 || opponentAttackers.length > 0) {
			if (currentAttacker === 0 && playerAttackers.length > 0) {
				const attacker = playerAttackers.splice(0, 1)[0];
				// console.log('[start of combat] will perform player attack', attacker);
				[playerBoard, opponentBoard] = this.performStartOfCombat(attacker, playerBoard, opponentBoard);
			} else if (currentAttacker === 1 && opponentAttackers.length > 0) {
				const attacker = opponentAttackers.splice(0, 1)[0];
				// console.log('[start of combat] will perform opponent attack', attacker);
				[opponentBoard, playerBoard] = this.performStartOfCombat(attacker, opponentBoard, playerBoard);
			}
			currentAttacker = (currentAttacker + 1) % 2;
		}
		return [playerBoard, opponentBoard];
	}

	private performStartOfCombat(
		attacker: BoardEntity,
		attackingBoard: readonly BoardEntity[],
		defendingBoard: readonly BoardEntity[],
	): [readonly BoardEntity[], readonly BoardEntity[]] {
		// For now we're only dealing with the red whelp
		if (attacker.cardId === 'BGS_019') {
			const damage = attackingBoard
				.map(entity => this.allCards.getCard(entity.cardId).race)
				.filter(race => race === 'DRAGON').length;
			console.log('[start of combat] damage', damage);
			[defendingBoard, attackingBoard] = dealDamageToRandomEnemy(
				defendingBoard,
				attacker,
				damage,
				attackingBoard,
				this.allCards,
				this.spawns,
				this.sharedState,
			);
		} else if (attacker.cardId === 'TB_BaconUps_102') {
			const damage = attackingBoard
				.map(entity => this.allCards.getCard(entity.cardId).race)
				.filter(race => race === 'DRAGON').length;
			[defendingBoard, attackingBoard] = dealDamageToRandomEnemy(
				defendingBoard,
				attacker,
				damage,
				attackingBoard,
				this.allCards,
				this.spawns,
				this.sharedState,
			);
			[defendingBoard, attackingBoard] = dealDamageToRandomEnemy(
				defendingBoard,
				attacker,
				damage,
				attackingBoard,
				this.allCards,
				this.spawns,
				this.sharedState,
			);
		}
		return [attackingBoard, defendingBoard];
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
		[attackingBoard, defendingBoard] = applyGlobalModifiers(
			attackingBoard,
			defendingBoard,
			this.spawns,
			this.allCards,
		);
		attackingBoard = applyAuras(attackingBoard, this.spawns, this.allCards);
		defendingBoard = applyAuras(defendingBoard, this.spawns, this.allCards);

		attackingBoard = attackingBoard.map(entity => ({ ...entity, lastAffectedByEntity: undefined } as BoardEntity));
		defendingBoard = defendingBoard.map(entity => ({ ...entity, lastAffectedByEntity: undefined } as BoardEntity));
		let attackingEntity: BoardEntity;
		[attackingEntity, attackingBoard] = this.getAttackingEntity(attackingBoard, lastAttackerEntityId);
		if (attackingEntity) {
			const numberOfAttacks = attackingEntity.megaWindfury ? 4 : attackingEntity.windfury ? 2 : 1;
			for (let i = 0; i < numberOfAttacks; i++) {
				// We refresh the entity in case of windfury
				console.log('before', attackingEntity);
				attackingEntity = attackingBoard.find(entity => entity.entityId === attackingEntity.entityId);
				console.log('after', attackingEntity);
				if (attackingEntity) {
					// console.log('attackingEntity', attackingEntity, attackingBoard);
					attackingEntity = applyOnAttackBuffs(attackingEntity);
					const defendingEntity: BoardEntity = getDefendingEntity(defendingBoard);
					console.log('battling between', attackingEntity, defendingEntity);
					[attackingBoard, defendingBoard] = this.performAttack(
						attackingEntity,
						defendingEntity,
						attackingBoard,
						defendingBoard,
					);
				}
			}
			// console.log('attacking board', attackingBoard, 'defending board', defendingBoard);
		}
		// return [[], []];
		// console.log('before removing auras', attackingBoard, defendingBoard);
		attackingBoard = removeAuras(attackingBoard, this.spawns);
		defendingBoard = removeAuras(defendingBoard, this.spawns);
		[attackingBoard, defendingBoard] = removeGlobalModifiers(
			attackingBoard,
			defendingBoard,
			this.spawns,
			this.allCards,
		);
		console.log('after removing auras', attackingBoard, defendingBoard);
		return [attackingBoard, defendingBoard];
	}

	private performAttack(
		attackingEntity: BoardEntity,
		defendingEntity: BoardEntity,
		attackingBoard: readonly BoardEntity[],
		defendingBoard: readonly BoardEntity[],
	): [readonly BoardEntity[], readonly BoardEntity[]] {
		let newAttackingEntity, newDefendingEntity;
		[newAttackingEntity, attackingBoard] = bumpEntities(
			attackingEntity,
			defendingEntity,
			attackingBoard,
			this.allCards,
			this.sharedState,
		);
		[newDefendingEntity, defendingBoard] = bumpEntities(
			defendingEntity,
			attackingEntity,
			defendingBoard,
			this.allCards,
			this.sharedState,
		);
		console.log('after damage', newAttackingEntity, newDefendingEntity);
		const updatedDefenders = [newDefendingEntity];
		// Cleave
		if (newAttackingEntity.cleave) {
			const neighbours: readonly BoardEntity[] = this.getNeighbours(defendingBoard, defendingEntity);
			for (let neighbour of neighbours) {
				[neighbour, defendingBoard] = bumpEntities(
					neighbour,
					newAttackingEntity,
					defendingBoard,
					this.allCards,
					this.sharedState,
				);
				updatedDefenders.push(neighbour);
			}
		}

		// Approximate the play order
		updatedDefenders.sort((a, b) => a.entityId - b.entityId);

		const attackerIndex = attackingBoard.map(e => e.entityId).indexOf(newAttackingEntity.entityId);
		const updatedAttackingBoard = [...attackingBoard];
		updatedAttackingBoard[attackerIndex] = newAttackingEntity;

		const updatedDefendingBoard = [...defendingBoard];
		for (const def of updatedDefenders) {
			const defenderIndex = defendingBoard.map(e => e.entityId).indexOf(def.entityId);
			updatedDefendingBoard[defenderIndex] = def;
		}

		// console.log('processing minion death in attacking board', attackingBoard, 'killer?', newDefendingEntity);
		[attackingBoard, defendingBoard] = processMinionDeath(
			updatedAttackingBoard,
			// [newAttackingEntity],
			updatedDefendingBoard,
			// newDefendingEntity,
			this.allCards,
			this.spawns,
			this.sharedState,
		);
		// console.log('baords after porocessing minion deaths', attackingBoard, defendingBoard);
		// console.log('processing minion death in defending board', defendingBoard, 'killer?', newAttackingEntity);
		// [defendingBoard, attackingBoard] = processMinionDeath(
		// 	defendingBoard,
		// 	// updatedDefenders,
		// 	attackingBoard,
		// 	newAttackingEntity,
		// 	this.allCards,
		// 	this.spawns,
		// 	this.sharedState,
		// );
		// console.log('baords after porocessing minion death in defendingBoard', attackingBoard, defendingBoard);
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

	private getAttackingEntity(
		attackingBoard: readonly BoardEntity[],
		lastAttackerEntityId: number,
	): [BoardEntity, readonly BoardEntity[]] {
		const validAttackers = attackingBoard.filter(entity => entity.attack > 0);
		if (validAttackers.length === 0) {
			return [null, attackingBoard];
		}
		let attackingEntity = validAttackers[0];
		let minNumberOfAttacks: number = attackingEntity.attacksPerformed;
		for (const entity of validAttackers) {
			if (entity.attacksPerformed < minNumberOfAttacks) {
				attackingEntity = entity;
				minNumberOfAttacks = entity.attacksPerformed;
			}
		}

		const newAttackingEntity = {
			...attackingEntity,
			attacksPerformed: attackingEntity.attacksPerformed + 1,
			attacking: true,
		};
		console.log('board before', attackingBoard);
		const index = attackingBoard.map(entity => entity.entityId).indexOf(attackingEntity.entityId);
		const tempBoard = [...attackingBoard];
		tempBoard.splice(index, 1, newAttackingEntity);
		attackingBoard = tempBoard;
		console.log('board after', attackingBoard, index);
		return [newAttackingEntity, attackingBoard];
	}

	private buildBoardTotalDamage(playerBoard: readonly BoardEntity[]) {
		return playerBoard
			.map(entity => this.allCards.getCard(entity.cardId).techLevel || 1)
			.reduce((a, b) => a + b, 0);
	}
}
