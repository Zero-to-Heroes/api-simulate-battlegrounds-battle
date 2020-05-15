import { AllCardsService } from '@firestone-hs/reference-data';
import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';
import { PlayerEntity } from '../player-entity';
import { SingleSimulationResult } from '../single-simulation-result';
import { simulateAttack } from './attack';
import { SharedState } from './shared-state';
import { handleStartOfCombat } from './start-of-combat';

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
		// console.debug('before start of combat\n', stringifySimple(opponentBoard) + '\n', stringifySimple(playerBoard));
		handleStartOfCombat(
			playerEntity,
			playerBoard,
			opponentEntity,
			opponentBoard,
			this.allCards,
			this.spawns,
			this.sharedState,
		);
		// console.debug('after start of combat\n', stringifySimple(opponentBoard) + '\n', stringifySimple(playerBoard));
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
			// console.debug('starting round\n', stringifySimple(opponentBoard) + '\n', stringifySimple(playerBoard));
			if (this.currentAttacker === 0) {
				simulateAttack(
					playerBoard,
					playerEntity,
					opponentBoard,
					opponentEntity,
					this.lastPlayerAttackerEntityId,
					this.allCards,
					this.spawns,
					this.sharedState,
				);
			} else {
				simulateAttack(
					opponentBoard,
					opponentEntity,
					playerBoard,
					playerEntity,
					this.lastOpponentAttackerEntityId,
					this.allCards,
					this.spawns,
					this.sharedState,
				);
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

	private buildBoardTotalDamage(playerBoard: readonly BoardEntity[]) {
		return playerBoard
			.map(entity => this.allCards.getCard(entity.cardId).techLevel || 1)
			.reduce((a, b) => a + b, 0);
	}
}
