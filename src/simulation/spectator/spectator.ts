import { BoardEntity } from '../../board-entity';
import { GameAction } from './game-action';
import { GameSample } from './game-sample';

const MAX_SAMPLES = 1;

export class Spectator {
	private actionsForCurrentBattle: GameAction[];
	private wonBattles: GameSample[];
	private tiedBattles: GameSample[];
	private lostBattles: GameSample[];

	constructor(
		private readonly playerCardId?: string,
		private readonly playerHeroPowerCardId?: string,
		private readonly opponentCardId?: string,
		private readonly opponentHeroPowerCardId?: string,
	) {
		this.actionsForCurrentBattle = [];
		this.wonBattles = [];
		this.tiedBattles = [];
		this.lostBattles = [];
	}

	public prune() {
		this.wonBattles = this.wonBattles.slice(0, MAX_SAMPLES);
		this.lostBattles = this.lostBattles.slice(0, MAX_SAMPLES);
		this.tiedBattles = this.tiedBattles.slice(0, MAX_SAMPLES);
	}

	public buildOutcomeSamples(): {
		won: readonly GameSample[];
		lost: readonly GameSample[];
		tied: readonly GameSample[];
	} {
		return {
			won: this.wonBattles,
			lost: this.lostBattles,
			tied: this.tiedBattles,
		};
	}

	public commitBattleResult(result: 'won' | 'lost' | 'tied') {
		if (this.wonBattles.length >= MAX_SAMPLES && this.lostBattles.length >= MAX_SAMPLES && this.tiedBattles.length >= MAX_SAMPLES) {
			this.actionsForCurrentBattle = [];
			return;
		}
		const actionsForBattle = this.collapseActions(this.actionsForCurrentBattle);
		this.actionsForCurrentBattle = [];

		switch (result) {
			case 'won':
				this.wonBattles.push({
					actions: actionsForBattle,
					playerCardId: this.playerCardId,
					playerHeroPowerCardId: this.playerHeroPowerCardId,
					opponentCardId: this.opponentCardId,
					opponentHeroPowerCardId: this.opponentHeroPowerCardId,
				});
				break;
			case 'lost':
				this.lostBattles.push({
					actions: actionsForBattle,
					playerCardId: this.playerCardId,
					playerHeroPowerCardId: this.playerHeroPowerCardId,
					opponentCardId: this.opponentCardId,
					opponentHeroPowerCardId: this.opponentHeroPowerCardId,
				});
				break;
			case 'tied':
				this.tiedBattles.push({
					actions: actionsForBattle,
					playerCardId: this.playerCardId,
					playerHeroPowerCardId: this.playerHeroPowerCardId,
					opponentCardId: this.opponentCardId,
					opponentHeroPowerCardId: this.opponentHeroPowerCardId,
				});
				break;
		}
	}

	private collapseActions(actions: readonly GameAction[]): readonly GameAction[] {
		if (!actions || actions.length === 0) {
			return [];
		}
		const result: GameAction[] = [];
		for (let i = 0; i < actions.length; i++) {
			const action = actions[i];
			const lastAction = result.length > 0 ? result[result.length - 1] : null;

			if (lastAction && !action.playerBoard) {
				action.playerBoard = lastAction.playerBoard;
			}
			if (lastAction && !action.opponentBoard) {
				action.opponentBoard = lastAction.opponentBoard;
			}

			if (lastAction && action.type === 'damage' && lastAction.type === 'attack') {
				lastAction.damages = lastAction.damages || [];
				lastAction.damages.push({
					damage: action.damages[0].damage,
					sourceEntityId: action.damages[0].sourceEntityId,
					targetEntityId: action.damages[0].targetEntityId,
				});
			} else if (lastAction && action.type === 'damage' && lastAction.type === 'damage') {
				lastAction.damages = lastAction.damages || [];
				lastAction.damages.push({
					damage: action.damages[0].damage,
					sourceEntityId: action.damages[0].sourceEntityId,
					targetEntityId: action.damages[0].targetEntityId,
				});
			} else {
				result.push(action);
			}
		}
		return result;
	}

	private sanitize(board: readonly BoardEntity[]): readonly BoardEntity[] {
		if (!board || board.length === 0) {
			return undefined;
		}
		return board.map(
			(entity) =>
				({
					...entity,
					enchantments: undefined,
					cantAttack: undefined,
					attacksPerformed: undefined,
					attackImmediately: undefined,
					previousAttack: undefined,
					lastAffectedByEntity: undefined,
					attacking: undefined,
				} as BoardEntity),
		);
	}

	public registerAttack(
		attackingEntity: BoardEntity,
		defendingEntity: BoardEntity,
		attackingBoard: readonly BoardEntity[],
		defendingBoard: readonly BoardEntity[],
	) {
		const friendlyBoard = attackingBoard.every((entity) => entity.friendly) ? attackingBoard : defendingBoard;
		const opponentBoard = defendingBoard.every((entity) => entity.friendly) ? attackingBoard : defendingBoard;
		const action: GameAction = {
			type: 'attack',
			sourceEntityId: attackingEntity.entityId,
			targetEntityId: defendingEntity.entityId,
			playerBoard: this.sanitize(friendlyBoard),
			opponentBoard: this.sanitize(opponentBoard),
		};
		this.actionsForCurrentBattle.push(action);
	}

	public registerDamageDealt(
		damagingEntity: BoardEntity,
		damagedEntity: BoardEntity,
		damageTaken: number,
		damagedEntityBoard: BoardEntity[],
	) {
		if (!damagingEntity.entityId) {
			console.error('missing damaging entity id', damagingEntity);
		}
		const friendlyBoard = damagedEntityBoard.every((entity) => entity.friendly) ? damagedEntityBoard : null;
		const opponentBoard = damagedEntityBoard.every((entity) => !entity.friendly) ? damagedEntityBoard : null;
		const action: GameAction = {
			type: 'damage',
			damages: [
				{
					sourceEntityId: damagingEntity.entityId,
					targetEntityId: damagedEntity.entityId,
					damage: damageTaken,
				},
			],
			playerBoard: this.sanitize(friendlyBoard),
			opponentBoard: this.sanitize(opponentBoard),
		};
		this.actionsForCurrentBattle.push(action);
	}

	public registerPowerTarget(sourceEntity: BoardEntity, targetEntity: BoardEntity, targetBoard: BoardEntity[]) {
		if (!sourceEntity.entityId) {
			console.error('missing damaging entity id', sourceEntity);
		}
		const friendlyBoard = targetBoard.every((entity) => entity.friendly) ? targetBoard : null;
		const opponentBoard = targetBoard.every((entity) => !entity.friendly) ? targetBoard : null;
		const action: GameAction = {
			type: 'power-target',
			sourceEntityId: sourceEntity.entityId,
			targetEntityId: targetEntity.entityId,
			playerBoard: this.sanitize(friendlyBoard),
			opponentBoard: this.sanitize(opponentBoard),
		};
		this.actionsForCurrentBattle.push(action);
	}

	public registerMinionsSpawn(boardOnWhichToSpawn: BoardEntity[], spawnedEntities: readonly BoardEntity[]) {
		if (!spawnedEntities || spawnedEntities.length === 0) {
			return;
		}
		const friendlyBoard = boardOnWhichToSpawn.every((entity) => entity.friendly) ? boardOnWhichToSpawn : null;
		const opponentBoard = boardOnWhichToSpawn.every((entity) => !entity.friendly) ? boardOnWhichToSpawn : null;
		const action: GameAction = {
			type: 'spawn',
			spawns: this.sanitize(spawnedEntities),
			playerBoard: this.sanitize(friendlyBoard),
			opponentBoard: this.sanitize(opponentBoard),
		};
		this.actionsForCurrentBattle.push(action);
	}

	public registerDeadEntities(
		deadMinionIndexes1: number[],
		deadEntities1: BoardEntity[],
		deadMinionIndexes2: number[],
		deadEntities2: BoardEntity[],
	) {
		const deaths = [...(deadEntities1 || []), ...(deadEntities2 || [])];
		if (!deaths || deaths.length === 0) {
			return;
		}
		const action: GameAction = {
			type: 'minion-death',
			deaths: this.sanitize(deaths),
			deadMinionsPositionsOnBoard: [...(deadMinionIndexes1 || []), ...(deadMinionIndexes2 || [])],
			playerBoard: undefined,
			opponentBoard: undefined,
		};
		this.actionsForCurrentBattle.push(action);
	}
}
