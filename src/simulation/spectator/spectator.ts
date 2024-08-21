import { BgsPlayerEntity, BoardTrinket } from '../../bgs-player-entity';
import { BoardEntity } from '../../board-entity';
import { BoardSecret } from '../../board-secret';
import { GameAction, buildGameAction } from './game-action';
import { GameSample } from './game-sample';

const MAX_SAMPLES = 1;

export class Spectator {
	private actionsForCurrentBattle: GameAction[];
	private wonBattles: GameSample[];
	private tiedBattles: GameSample[];
	private lostBattles: GameSample[];

	constructor() {
		this.actionsForCurrentBattle = [];
		this.wonBattles = [];
		this.tiedBattles = [];
		this.lostBattles = [];
	}

	public prune(): void {
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
			won: this.wonBattles?.map((battle) => this.cleanUpActions(battle)),
			lost: this.lostBattles?.map((battle) => this.cleanUpActions(battle)),
			tied: this.tiedBattles?.map((battle) => this.cleanUpActions(battle)),
		};
	}

	private cleanUpActions(battle: GameSample): GameSample {
		const collapsed = this.collapseActions(battle.actions);
		const result: GameSample = {
			...battle,
			actions: collapsed,
		};
		return result;
	}

	public commitBattleResult(result: 'won' | 'lost' | 'tied'): void {
		if (
			this.wonBattles.length >= MAX_SAMPLES &&
			this.lostBattles.length >= MAX_SAMPLES &&
			this.tiedBattles.length >= MAX_SAMPLES
		) {
			this.actionsForCurrentBattle = [];
			return;
		}
		// const actionsForBattle = this.collapseActions(this.actionsForCurrentBattle);
		const actionsForBattle = this.actionsForCurrentBattle;
		this.actionsForCurrentBattle = [];

		const battle: GameSample = {
			actions: actionsForBattle,
		};
		switch (result) {
			case 'won':
				this.wonBattles.push(battle);
				break;
			case 'lost':
				this.lostBattles.push(battle);
				break;
			case 'tied':
				this.tiedBattles.push(battle);
				break;
		}
	}

	public registerAttack(
		attackingEntity: BoardEntity,
		defendingEntity: BoardEntity,
		attackingBoard: readonly BoardEntity[],
		defendingBoard: readonly BoardEntity[],
		attackingBoardHero: BgsPlayerEntity,
		defendingBoardHero: BgsPlayerEntity,
	): void {
		// console.debug(
		// 	'\n register attack',
		// 	stringifySimple(attackingBoard),
		// 	'\n',
		// 	stringifySimple(defendingBoard),
		// 	'\n',
		// 	attackingBoard.find((e) => e.entityId === 2441),
		// 	'\n',
		// 	attackingBoard.find((e) => e.entityId === 2442),
		// );
		const isAttackerFriendly = attackingBoard.every((entity) => entity.friendly);
		const playerHero = isAttackerFriendly ? attackingBoardHero : defendingBoardHero;
		const opponentHero = isAttackerFriendly ? defendingBoardHero : attackingBoardHero;
		const friendlyBoard = isAttackerFriendly ? attackingBoard : defendingBoard;
		const opponentBoard = isAttackerFriendly ? defendingBoard : attackingBoard;
		const action: GameAction = buildGameAction(playerHero, opponentHero, {
			type: 'attack',
			sourceEntityId: attackingEntity.entityId,
			targetEntityId: defendingEntity.entityId,
			playerBoard: this.sanitize(friendlyBoard),
			playerHand: this.sanitize(playerHero.hand),
			opponentBoard: this.sanitize(opponentBoard),
			opponentHand: this.sanitize(opponentHero.hand),
		});
		this.addAction(action);
	}

	public registerStartOfCombat(
		friendlyBoard: readonly BoardEntity[],
		opponentBoard: readonly BoardEntity[],
		friendlyHero: BgsPlayerEntity,
		opponentHero: BgsPlayerEntity,
	): void {
		const action: GameAction = buildGameAction(friendlyHero, opponentHero, {
			type: 'start-of-combat',
			playerBoard: this.sanitize(friendlyBoard),
			opponentBoard: this.sanitize(opponentBoard),
			playerHand: this.sanitize(friendlyHero.hand),
			opponentHand: this.sanitize(opponentHero.hand),
		});
		this.addAction(action);
	}

	public registerPlayerAttack(
		friendlyBoard: readonly BoardEntity[],
		opponentBoard: readonly BoardEntity[],
		damage: number,
	): void {
		const action: GameAction = buildGameAction(null, null, {
			type: 'player-attack',
			playerBoard: this.sanitize(friendlyBoard),
			opponentBoard: this.sanitize(opponentBoard),
			playerHand: null,
			opponentHand: null,
			damages: [
				{
					damage: damage,
				},
			],
		});
		this.addAction(action);
	}

	public registerOpponentAttack(
		friendlyBoard: readonly BoardEntity[],
		opponentBoard: readonly BoardEntity[],
		damage: number,
	): void {
		const action: GameAction = buildGameAction(null, null, {
			type: 'opponent-attack',
			playerBoard: this.sanitize(friendlyBoard),
			opponentBoard: this.sanitize(opponentBoard),
			playerHand: null,
			opponentHand: null,
			damages: [
				{
					damage: damage,
				},
			],
		});
		this.addAction(action);
	}

	public registerDamageDealt(
		damagingEntity: BoardEntity,
		damagedEntity: BoardEntity,
		damageTaken: number,
		damagedEntityBoard: BoardEntity[],
	): void {
		if (!damagingEntity.entityId) {
			// console.error('missing damaging entity id', damagingEntity.cardId);
		}
		const friendlyBoard = damagedEntityBoard.every((entity) => entity.friendly) ? damagedEntityBoard : null;
		const opponentBoard = damagedEntityBoard.every((entity) => !entity.friendly) ? damagedEntityBoard : null;
		const action: GameAction = buildGameAction(null, null, {
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
			playerHand: null,
			opponentHand: null,
		});
		this.addAction(action);
	}

	public registerPowerTarget(
		sourceEntity: BoardEntity | BgsPlayerEntity | BoardSecret | BoardTrinket,
		targetEntity: BoardEntity | BgsPlayerEntity,
		targetBoard: BoardEntity[],
		hero1: BgsPlayerEntity,
		hero2: BgsPlayerEntity,
	): void {
		if (!targetEntity) {
			return;
		}
		if (!sourceEntity.entityId && !(sourceEntity as BgsPlayerEntity).heroPowerId) {
			// console.error('missing damaging entity id', sourceEntity.cardId);
		}
		// console.log('registerPowerTarget', stringifySimpleCard(sourceEntity), stringifySimpleCard(targetEntity), new Error().stack);
		const friendlyBoard = targetBoard?.every((entity) => entity.friendly) ? targetBoard : null;
		const opponentBoard = targetBoard?.every((entity) => !entity.friendly) ? targetBoard : null;
		const friendlyHero = hero1?.friendly ? hero1 : hero2?.friendly ? hero2 : null;
		const opponentHero = hero1?.friendly ? hero2 : hero2?.friendly ? hero1 : null;
		const action: GameAction = buildGameAction(friendlyHero, opponentHero, {
			type: 'power-target',
			sourceEntityId: sourceEntity.entityId,
			targetEntityId: targetEntity.entityId,
			playerBoard: this.sanitize(friendlyBoard),
			opponentBoard: this.sanitize(opponentBoard),
			playerHand: this.sanitize(friendlyHero?.hand),
			opponentHand: this.sanitize(opponentHero?.hand),
		});
		this.addAction(action);
	}

	public registerMinionsSpawn(
		sourceEntity: BoardEntity | BgsPlayerEntity,
		boardOnWhichToSpawn: BoardEntity[],
		spawnedEntities: readonly BoardEntity[],
	): void {
		if (!spawnedEntities || spawnedEntities.length === 0) {
			return;
		}

		if (!sourceEntity?.entityId) {
			// console.error('missing spawn source entity id', sourceEntity);
		}
		const friendlyBoard = boardOnWhichToSpawn.every((entity) => entity.friendly) ? boardOnWhichToSpawn : null;
		const opponentBoard = boardOnWhichToSpawn.every((entity) => !entity.friendly) ? boardOnWhichToSpawn : null;
		const action: GameAction = buildGameAction(null, null, {
			type: 'spawn',
			spawns: this.sanitize(spawnedEntities),
			sourceEntityId: sourceEntity?.entityId,
			playerBoard: this.sanitize(friendlyBoard),
			opponentBoard: this.sanitize(opponentBoard),
			playerHand: null,
			opponentHand: null,
		});
		this.addAction(action);
	}

	public registerDeadEntities(
		deadMinionIndexes1: number[],
		deadEntities1: BoardEntity[],
		board1: BoardEntity[],
		deadMinionIndexes2: number[],
		deadEntities2: BoardEntity[],
		board2: BoardEntity[],
	): void {
		const deaths = [...(deadEntities1 || []), ...(deadEntities2 || [])];
		if (!deaths || deaths.length === 0) {
			return;
		}
		const action: GameAction = buildGameAction(null, null, {
			type: 'minion-death',
			deaths: this.sanitize(deaths),
			deadMinionsPositionsOnBoard: [
				...(deadMinionIndexes1 || []).map((i) => board1.length - i),
				...(deadMinionIndexes2 || []).map((i) => board2.length - i),
			],
		});
		this.addAction(action);
	}

	private addAction(action: GameAction) {
		this.actionsForCurrentBattle.push(action);
	}

	private collapseActions(actions: readonly GameAction[]): readonly GameAction[] {
		if (!actions || actions.length === 0) {
			return [];
		}
		const result: GameAction[] = [];
		for (let i = 0; i < actions.length; i++) {
			const action: GameAction = {
				...actions[i],
				playerBoard: this.sanitize(actions[i].playerBoard),
				opponentBoard: this.sanitize(actions[i].opponentBoard),
				playerHand: this.sanitize(actions[i].playerHand),
				opponentHand: this.sanitize(actions[i].opponentHand),
				// spawns: this.sanitize(actions[i].spawns),
				deaths: this.sanitize(actions[i].deaths),
			};
			// action.playerBoard && console.debug('\naction playerboard', stringifySimple(action.playerBoard));
			const lastAction = result.length > 0 ? result[result.length - 1] : null;

			if (lastAction) {
				action.playerBoard = action.playerBoard ?? lastAction.playerBoard;
				action.opponentBoard = action.opponentBoard ?? lastAction.opponentBoard;
				action.playerHand = action.playerHand ?? lastAction.playerHand;
				action.opponentHand = action.opponentHand ?? lastAction.opponentHand;
				action.playerSecrets = action.playerSecrets ?? lastAction.playerSecrets;
				action.opponentSecrets = action.opponentSecrets ?? lastAction.opponentSecrets;
				action.playerRewardCardId = action.playerRewardCardId ?? lastAction.playerRewardCardId;
				action.playerRewardEntityId = action.playerRewardEntityId ?? lastAction.playerRewardEntityId;
				action.playerRewardData = action.playerRewardData ?? lastAction.playerRewardData;
				action.opponentRewardCardId = action.opponentRewardCardId ?? lastAction.opponentRewardCardId;
				action.opponentRewardEntityId = action.opponentRewardEntityId ?? lastAction.opponentRewardEntityId;
				action.opponentRewardData = action.opponentRewardData ?? lastAction.opponentRewardData;
				action.playerCardId = action.playerCardId ?? lastAction.playerCardId;
				action.playerEntityId = action.playerEntityId ?? lastAction.playerEntityId;
				action.playerHeroPowerCardId = action.playerHeroPowerCardId ?? lastAction.playerHeroPowerCardId;
				action.playerHeroPowerEntityId = action.playerHeroPowerEntityId ?? lastAction.playerHeroPowerEntityId;
				action.playerHeroPowerUsed = action.playerHeroPowerUsed ?? lastAction.playerHeroPowerUsed;
				action.opponentCardId = action.opponentCardId ?? lastAction.opponentCardId;
				action.opponentEntityId = action.opponentEntityId ?? lastAction.opponentEntityId;
				action.opponentHeroPowerCardId = action.opponentHeroPowerCardId ?? lastAction.opponentHeroPowerCardId;
				action.opponentHeroPowerEntityId =
					action.opponentHeroPowerEntityId ?? lastAction.opponentHeroPowerEntityId;
				action.opponentHeroPowerUsed = action.opponentHeroPowerUsed ?? lastAction.opponentHeroPowerUsed;
				action.playerTrinkets = action.playerTrinkets ?? lastAction.playerTrinkets;
				action.opponentTrinkets = action.opponentTrinkets ?? lastAction.opponentTrinkets;
			}

			if (lastAction && action.type === 'damage' && lastAction.type === 'attack') {
				lastAction.damages = lastAction.damages || [];
				lastAction.damages.push({
					damage: action.damages[0].damage,
					sourceEntityId: action.damages[0].sourceEntityId,
					targetEntityId: action.damages[0].targetEntityId,
				});
				lastAction.playerBoard = action.playerBoard;
				lastAction.opponentBoard = action.opponentBoard;
				lastAction.playerHand = action.playerHand;
				lastAction.opponentHand = action.opponentHand;
				lastAction.playerSecrets = action.playerSecrets;
				lastAction.opponentSecrets = action.opponentSecrets;
				lastAction.playerTrinkets = action.playerTrinkets;
				lastAction.opponentTrinkets = action.opponentTrinkets;
			} else if (lastAction && action.type === 'damage' && lastAction.type === 'damage') {
				lastAction.damages = lastAction.damages || [];
				lastAction.damages.push({
					damage: action.damages[0].damage,
					sourceEntityId: action.damages[0].sourceEntityId,
					targetEntityId: action.damages[0].targetEntityId,
				});
				lastAction.playerBoard = action.playerBoard;
				lastAction.opponentBoard = action.opponentBoard;
				lastAction.playerHand = action.playerHand;
				lastAction.opponentHand = action.opponentHand;
				lastAction.playerSecrets = action.playerSecrets;
				lastAction.opponentSecrets = action.opponentSecrets;
				lastAction.playerTrinkets = action.playerTrinkets;
				lastAction.opponentTrinkets = action.opponentTrinkets;
			} else if (
				lastAction &&
				action.type === 'power-target' &&
				lastAction.type === 'power-target' &&
				action.sourceEntityId === lastAction.sourceEntityId
			) {
				lastAction.targetEntityIds =
					lastAction.targetEntityIds ?? (lastAction.targetEntityId ? [lastAction.targetEntityId] : []);
				action.targetEntityIds =
					action.targetEntityIds ?? (action.targetEntityId ? [action.targetEntityId] : []);
				lastAction.targetEntityIds.push(...action.targetEntityIds);
				// So that when multiple Leapfroggers enchantments target the same minion,
				// we can count them in the replay viewer's text
				// lastAction.targetEntityIds = [...new Set(lastAction.targetEntityIds)];
				lastAction.playerBoard = action.playerBoard;
				lastAction.opponentBoard = action.opponentBoard;
				lastAction.playerHand = action.playerHand;
				lastAction.opponentHand = action.opponentHand;
				lastAction.playerSecrets = action.playerSecrets;
				lastAction.opponentSecrets = action.opponentSecrets;
				lastAction.playerTrinkets = action.playerTrinkets;
				lastAction.opponentTrinkets = action.opponentTrinkets;
			} else {
				result.push(action);
			}
		}

		return result;
	}

	// Calling sanitize every time before we add an action to the list is mandatory, since
	// the entities and boards are mutable
	private sanitize(board: readonly BoardEntity[]): readonly BoardEntity[] {
		if (!board) {
			return undefined;
		}
		return board.map(
			(entity) =>
				({
					entityId: entity.entityId,
					cardId: entity.cardId,
					friendly: entity.friendly,
					attack: entity.attack,
					health: entity.health,
					maxHealth: entity.maxHealth,
					taunt: entity.taunt,
					divineShield: entity.divineShield,
					poisonous: entity.poisonous,
					venomous: entity.venomous,
					reborn: entity.reborn,
					windfury: entity.windfury,
					stealth: entity.stealth,
				} as BoardEntity),
		);
	}
}
