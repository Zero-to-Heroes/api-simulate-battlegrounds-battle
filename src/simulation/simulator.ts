import { AllCardsService } from '@firestone-hs/reference-data';
import { BoardEntity } from '../board-entity';
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
		playerBoard: BoardEntity[],
		playerEntity: PlayerEntity,
		opponentBoard: BoardEntity[],
		opponentEntity: PlayerEntity,
	): SingleSimulationResult {
		this.sharedState.currentEntityId =
			Math.max(...playerBoard.map(entity => entity.entityId), ...opponentBoard.map(entity => entity.entityId)) +
			1;
		this.handleStartOfCombat(playerBoard, opponentBoard);
		// let boards = [playerBoard, opponentBoard];
		// console.log('boards', boards);
		this.currentAttacker =
			playerBoard.length > opponentBoard.length
				? 0
				: opponentBoard.length > playerBoard.length
				? 1
				: Math.round(Math.random());
		// console.log('starting player', this.currentAttacker);

		let counter = 0;
		while (playerBoard.length > 0 && opponentBoard.length > 0) {
			// console.log('starting round', playerBoard.length, opponentBoard.length); //, playerBoard, opponentBoard);
			if (this.currentAttacker === 0) {
				this.simulateAttack(playerBoard, opponentBoard, this.lastPlayerAttackerEntityId);
			} else {
				this.simulateAttack(opponentBoard, playerBoard, this.lastOpponentAttackerEntityId);
			}
			this.currentAttacker = (this.currentAttacker + 1) % 2;
			counter++;
			if (counter > 200) {
				console.warn('short-circuiting simulation, too many iterations', counter);
				return null;
			}
		}
		// console.log('battle over', playerBoard, opponentBoard);
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
	private handleStartOfCombat(playerBoard: BoardEntity[], opponentBoard: BoardEntity[]): void {
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
				this.performStartOfCombat(attacker, playerBoard, opponentBoard);
			} else if (currentAttacker === 1 && opponentAttackers.length > 0) {
				const attacker = opponentAttackers.splice(0, 1)[0];
				// console.log('[start of combat] will perform opponent attack', attacker);
				this.performStartOfCombat(attacker, opponentBoard, playerBoard);
			}
			currentAttacker = (currentAttacker + 1) % 2;
		}
		// return [playerBoard, opponentBoard];
	}

	private performStartOfCombat(
		attacker: BoardEntity,
		attackingBoard: BoardEntity[],
		defendingBoard: BoardEntity[],
	): void {
		// For now we're only dealing with the red whelp
		if (attacker.cardId === 'BGS_019') {
			const damage = attackingBoard
				.map(entity => this.allCards.getCard(entity.cardId).race)
				.filter(race => race === 'DRAGON').length;
			// console.log('[start of combat] damage', damage);
			dealDamageToRandomEnemy(
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
			dealDamageToRandomEnemy(
				defendingBoard,
				attacker,
				damage,
				attackingBoard,
				this.allCards,
				this.spawns,
				this.sharedState,
			);
			dealDamageToRandomEnemy(
				defendingBoard,
				attacker,
				damage,
				attackingBoard,
				this.allCards,
				this.spawns,
				this.sharedState,
			);
		}
		// return [attackingBoard, defendingBoard];
	}

	private simulateAttack(
		attackingBoard: BoardEntity[],
		defendingBoard: BoardEntity[],
		lastAttackerEntityId: number,
	): void {
		if (attackingBoard.length === 0 || defendingBoard.length === 0) {
			return;
		}
		applyGlobalModifiers(attackingBoard, defendingBoard, this.spawns, this.allCards);
		applyAuras(attackingBoard, this.spawns, this.allCards);
		applyAuras(defendingBoard, this.spawns, this.allCards);

		let attackingEntity = this.getAttackingEntity(attackingBoard, lastAttackerEntityId);
		if (attackingEntity) {
			const numberOfAttacks = attackingEntity.megaWindfury ? 4 : attackingEntity.windfury ? 2 : 1;
			for (let i = 0; i < numberOfAttacks; i++) {
				// We refresh the entity in case of windfury
				if (attackingBoard.length === 0 || defendingBoard.length === 0) {
					return;
					// return [attackingBoard, defendingBoard];
				}
				// console.log('before', attackingEntity);
				attackingEntity = attackingBoard.find(entity => entity.entityId === attackingEntity.entityId);
				// console.log('after', attackingEntity);
				if (attackingEntity) {
					// console.log('attackingEntity', attackingEntity, attackingBoard);
					applyOnAttackBuffs(attackingEntity);
					const defendingEntity: BoardEntity = getDefendingEntity(defendingBoard, attackingEntity);
					// console.log('battling between', attackingEntity, defendingEntity);
					this.performAttack(attackingEntity, defendingEntity, attackingBoard, defendingBoard);
				}
			}
			// console.log('attacking board', attackingBoard, 'defending board', defendingBoard);
		}
		// return [[], []];
		// console.log('before removing auras', attackingBoard, defendingBoard);
		removeAuras(attackingBoard, this.spawns);
		removeAuras(defendingBoard, this.spawns);
		removeGlobalModifiers(attackingBoard, defendingBoard);
		// console.log('after removing auras', attackingBoard, defendingBoard);
		// return [attackingBoard, defendingBoard];
	}

	private performAttack(
		attackingEntity: BoardEntity,
		defendingEntity: BoardEntity,
		attackingBoard: BoardEntity[],
		defendingBoard: BoardEntity[],
	): void {
		// let newAttackingEntity, newDefendingEntity;
		bumpEntities(attackingEntity, defendingEntity, attackingBoard, this.allCards, this.spawns, this.sharedState);
		bumpEntities(defendingEntity, attackingEntity, defendingBoard, this.allCards, this.spawns, this.sharedState);
		// console.log('after damage', attackingEntity, defendingEntity);
		const updatedDefenders = [defendingEntity];
		// Cleave
		if (attackingEntity.cleave) {
			const neighbours: readonly BoardEntity[] = this.getNeighbours(defendingBoard, defendingEntity);
			for (const neighbour of neighbours) {
				bumpEntities(neighbour, attackingEntity, defendingBoard, this.allCards, this.spawns, this.sharedState);
				updatedDefenders.push(neighbour);
			}
		}

		// Approximate the play order
		updatedDefenders.sort((a, b) => a.entityId - b.entityId);
		processMinionDeath(attackingBoard, defendingBoard, this.allCards, this.spawns, this.sharedState);
	}

	private getNeighbours(board: BoardEntity[], entity: BoardEntity): readonly BoardEntity[] {
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

	private getAttackingEntity(attackingBoard: BoardEntity[], lastAttackerEntityId: number): BoardEntity {
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

		attackingEntity.attacksPerformed++;
		attackingEntity.attacking = true;
		return attackingEntity;
	}

	private buildBoardTotalDamage(playerBoard: readonly BoardEntity[]) {
		return playerBoard
			.map(entity => this.allCards.getCard(entity.cardId).techLevel || 1)
			.reduce((a, b) => a + b, 0);
	}
}
