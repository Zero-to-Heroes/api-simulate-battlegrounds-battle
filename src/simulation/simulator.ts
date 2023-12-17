import { AllCardsService, getEffectiveTechLevel } from '@firestone-hs/reference-data';
import { BgsGameState } from '../bgs-battle-info';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';
import { SingleSimulationResult } from '../single-simulation-result';
import { buildSingleBoardEntity, stringifySimple } from '../utils';
import { performEntitySpawns, simulateAttack } from './attack';
import { clearStealthIfNeeded } from './auras';
import { SharedState } from './shared-state';
import { Spectator } from './spectator/spectator';
import { handleStartOfCombat } from './start-of-combat';

// New simulator should be instantiated for each match
export class Simulator {
	private currentAttacker: number;
	private currentSpeedAttacker = -1;
	private lastPlayerAttackerEntityIndex: number;
	private lastOpponentAttackerEntityIndex: number;
	private sharedState: SharedState;

	// It should come already initialized
	constructor(private readonly allCards: AllCardsService, private readonly spawns: CardsData) {
		this.sharedState = new SharedState();
	}

	// Here we suppose that the BoardEntity only contain at most the enchantments that are linked
	// to auras (so we probably should hand-filter that, since there are actually few auras)
	public simulateSingleBattle(
		playerBoard: BoardEntity[],
		playerEntity: BgsPlayerEntity,
		opponentBoard: BoardEntity[],
		opponentEntity: BgsPlayerEntity,
		gameState: BgsGameState,
		spectator: Spectator,
	): SingleSimulationResult {
		this.sharedState.anomalies = gameState.anomalies ?? [];
		spectator.registerStartOfCombat(playerBoard, opponentBoard);
		// Who attacks first is decided by the game before the hero power comes into effect. However, the full board (with the generated minion)
		// is sent tothe simulator
		// But in fact, the first player decision takes into account that additional minion. See
		// https://replays.firestoneapp.com/?reviewId=ddbbbe93-464b-4400-8e8d-4abca8680a2e
		// const effectivePlayerBoardLength =
		// 	playerEntity.heroPowerId === CardIds.heroPowerUsed
		// 		? playerBoard.length - 1
		// 		: playerBoard.length;
		// const effectiveOpponentBoardLength =
		// 	opponentEntity.heroPowerId === CardIds.heroPowerUsed
		// 		? opponentBoard.length - 1
		// 		: opponentBoard.length;
		const effectivePlayerBoardLength = playerBoard.length;
		const effectiveOpponentBoardLength = opponentBoard.length;
		this.currentAttacker =
			effectivePlayerBoardLength > effectiveOpponentBoardLength
				? 0
				: effectiveOpponentBoardLength > effectivePlayerBoardLength
				? 1
				: Math.round(Math.random());
		this.sharedState.currentEntityId =
			Math.max(
				...playerBoard.map((entity) => entity.entityId),
				...opponentBoard.map((entity) => entity.entityId),
			) + 1;
		const suggestedNewCurrentAttacker = handleStartOfCombat(
			playerEntity,
			playerBoard,
			opponentEntity,
			opponentBoard,
			this.currentAttacker,
			this.allCards,
			this.spawns,
			this.sharedState,
			gameState,
			spectator,
		);
		handleRapidReanimation(
			playerBoard,
			playerEntity,
			opponentBoard,
			opponentEntity,
			this.allCards,
			this.spawns,
			this.sharedState,
			spectator,
		);
		// console.log('suggestedNewCurrentAttacker', suggestedNewCurrentAttacker);
		// When both players have the same amount of minions, it's possible that Illidan's Start of Combat
		// ability causes the same player to attack twice in a row, which is not the case in real life
		// So when Illidan attacks first, we then look at the expected first attacker. If it was Illidan
		// once more, we switch. Otherwise, we just keep the attacker as planned
		// FIXME: this is probably bogus when both players have Illidan's hero power?
		// if (effectivePlayerBoardLength === effectiveOpponentBoardLength) {
		// Looking at some recent data (2022/05/29), there was one board with 5 entities + Illidan, and another with 3
		// The 5 entities attacked (because of Illidan), and then the other board attacked
		// So this means that Illidan made the attack turn pass over to the other player
		this.currentAttacker = suggestedNewCurrentAttacker;
		// }
		let counter = 0;
		while (playerBoard.length > 0 && opponentBoard.length > 0) {
			handleRapidReanimation(
				playerBoard,
				playerEntity,
				opponentBoard,
				opponentEntity,
				this.allCards,
				this.spawns,
				this.sharedState,
				spectator,
			);
			clearStealthIfNeeded(playerBoard, opponentBoard);
			// console.log('this.currentSpeedAttacker', this.currentAttacker);
			// If there are "attack immediately" minions, we keep the same player
			// We put it here so that it can kick in after the start of combat effects. However here we don't want
			// to change who attacks first, so we repeat that block again after all the attacks have been resolved
			// FIXME: This is not strictly correct - if there are multiple attack immediately
			// minions that spawn on both player sides it might get a bit more complex
			// but overall it works
			// Also, this doesn't work when there are several deathrattle competing
			// to know who triggers first. See the second test case of the scallywag.test.ts
			// that is not handled properly today (the attack should in some cases happen before
			// the other deathrattle procs)
			if (playerBoard.some((entity) => entity.attackImmediately)) {
				this.currentSpeedAttacker = 0;
			} else if (opponentBoard.some((entity) => entity.attackImmediately)) {
				this.currentSpeedAttacker = 1;
			} else {
				this.currentSpeedAttacker = -1;
			}
			if (
				playerBoard.filter((e) => e.attack > 0).length === 0 &&
				opponentBoard.filter((e) => e.attack > 0).length === 0
			) {
				break;
			}

			// console.log('this.currentSpeedAttacker 2', this.currentAttacker, this.currentSpeedAttacker);
			if (this.currentSpeedAttacker === 0 || (this.currentSpeedAttacker === -1 && this.currentAttacker === 0)) {
				const opponentEntitiesBeforeAttack = opponentBoard
					.map((e) => e.entityId)
					.slice(0, this.lastOpponentAttackerEntityIndex);
				const outputAttacker = simulateAttack(
					playerBoard,
					playerEntity,
					opponentBoard,
					opponentEntity,
					this.lastPlayerAttackerEntityIndex,
					this.allCards,
					this.spawns,
					this.sharedState,
					spectator,
				);
				// The "attack immediately" doesn't change the next attacker
				this.lastPlayerAttackerEntityIndex =
					this.currentSpeedAttacker === -1 ? outputAttacker : this.lastPlayerAttackerEntityIndex;
				const opponentEntitiesAfterAttack = opponentBoard.map((e) => e.entityId);
				const opponentEntitiesThatDied = opponentEntitiesBeforeAttack.filter(
					(e) => !opponentEntitiesAfterAttack.includes(e),
				);
				this.lastOpponentAttackerEntityIndex -= opponentEntitiesThatDied.length;
			} else {
				const playerEntitiesBeforeAttack = playerBoard
					.map((e) => e.entityId)
					.slice(0, this.lastPlayerAttackerEntityIndex);
				const outputAttacker = simulateAttack(
					opponentBoard,
					opponentEntity,
					playerBoard,
					playerEntity,
					this.lastOpponentAttackerEntityIndex,
					this.allCards,
					this.spawns,
					this.sharedState,
					spectator,
				);
				this.lastOpponentAttackerEntityIndex =
					this.currentSpeedAttacker === -1 ? outputAttacker : this.lastOpponentAttackerEntityIndex;
				const playerEntitiesAfterAttack = playerBoard.map((e) => e.entityId);
				const playerEntitiesThatDied = playerEntitiesBeforeAttack.filter(
					(e) => !playerEntitiesAfterAttack.includes(e),
				);
				this.lastPlayerAttackerEntityIndex -= playerEntitiesThatDied.length;
			}

			// Update the attacker indices in case there were some deaths
			if (playerBoard.some((entity) => entity.attackImmediately)) {
				this.currentSpeedAttacker = 0;
			} else if (opponentBoard.some((entity) => entity.attackImmediately)) {
				this.currentSpeedAttacker = 1;
			} else {
				this.currentSpeedAttacker = -1;
				this.currentAttacker = (this.currentAttacker + 1) % 2;
			}
			counter++;
			if (counter > 400) {
				console.warn(
					'short-circuiting simulation, too many iterations',
					counter,
					'\n',
					stringifySimple(playerBoard, this.allCards),
					'\n',
					stringifySimple(opponentBoard, this.allCards),
				);
				break;
				// return null;
			}
		}
		if (
			(playerBoard.length === 0 && opponentBoard.length === 0) ||
			// E.g. when both players have a 0-attack minion
			(playerBoard.length > 0 && opponentBoard.length > 0)
		) {
			return {
				result: 'tied',
			} as SingleSimulationResult;
		}
		if (playerBoard.length === 0) {
			const damage = this.buildBoardTotalDamage(opponentBoard) + opponentEntity.tavernTier;
			spectator.registerOpponentAttack(playerBoard, opponentBoard, damage);
			return {
				result: 'lost',
				damageDealt: damage,
			};
		}
		const damage = this.buildBoardTotalDamage(playerBoard) + playerEntity.tavernTier;
		spectator.registerPlayerAttack(playerBoard, opponentBoard, damage);
		return {
			result: 'won',
			damageDealt: damage,
		};
	}

	private buildBoardTotalDamage(playerBoard: readonly BoardEntity[]): number {
		return playerBoard
			.map((entity) => getEffectiveTechLevel(this.allCards.getCard(entity.cardId), this.allCards))
			.reduce((a, b) => a + b, 0);
	}
}

const handleRapidReanimation = (
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	allCards: AllCardsService,
	spawns: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
) => {
	if (playerEntity.rapidReanimationMinion) {
		handleRapidReanimationForPlayer(
			playerBoard,
			playerEntity,
			opponentBoard,
			opponentEntity,
			allCards,
			spawns,
			sharedState,
			spectator,
		);
	}
	if (opponentEntity.rapidReanimationMinion) {
		handleRapidReanimationForPlayer(
			opponentBoard,
			opponentEntity,
			playerBoard,
			playerEntity,
			allCards,
			spawns,
			sharedState,
			spectator,
		);
	}
};

const handleRapidReanimationForPlayer = (
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	allCards: AllCardsService,
	cardsData: CardsData,
	sharedState: SharedState,
	spectator: Spectator,
) => {
	if (playerBoard.length >= 7) {
		return;
	}
	const newMinion = buildSingleBoardEntity(
		playerEntity.rapidReanimationMinion.cardId,
		playerEntity,
		playerBoard,
		allCards,
		playerEntity.rapidReanimationMinion.friendly,
		sharedState.currentEntityId++,
		false,
		cardsData,
		sharedState,
		playerEntity.rapidReanimationMinion,
		null,
	);
	const indexFromRight = Math.min(playerBoard.length, playerEntity.rapidReanimationIndexFromRight ?? 0);
	performEntitySpawns(
		[newMinion],
		playerBoard,
		playerEntity,
		playerEntity,
		indexFromRight,
		opponentBoard,
		opponentEntity,
		allCards,
		cardsData,
		sharedState,
		spectator,
	);
	spectator.registerPowerTarget(playerEntity, newMinion, playerBoard);
	playerEntity.rapidReanimationMinion = null;
};
