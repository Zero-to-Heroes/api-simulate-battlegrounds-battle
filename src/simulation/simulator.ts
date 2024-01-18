import { getEffectiveTechLevel } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { SingleSimulationResult } from '../single-simulation-result';
import { buildSingleBoardEntity, stringifySimple } from '../utils';
import { performEntitySpawns, simulateAttack } from './attack';
import { clearStealthIfNeeded } from './auras';
import { FullGameState } from './internal-game-state';
import { handleStartOfCombat } from './start-of-combat';

// New simulator should be instantiated for each match
export class Simulator {
	private currentAttacker: number;
	private currentSpeedAttacker = -1;

	// It should come already initialized
	constructor(private readonly gameState: FullGameState) {}

	// Here we suppose that the BoardEntity only contain at most the enchantments that are linked
	// to auras (so we probably should hand-filter that, since there are actually few auras)
	public simulateSingleBattle(
		playerBoard: BoardEntity[],
		playerEntity: BgsPlayerEntity,
		opponentBoard: BoardEntity[],
		opponentEntity: BgsPlayerEntity,
	): SingleSimulationResult {
		this.gameState.spectator.registerStartOfCombat(playerBoard, opponentBoard, playerEntity, opponentEntity);
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
		this.gameState.sharedState.currentEntityId =
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
			this.gameState,
		);
		// handleRapidReanimation(
		// 	playerBoard,
		// 	playerEntity,
		// 	opponentBoard,
		// 	opponentEntity,
		// 	this.allCards,
		// 	this.spawns,
		// 	this.sharedState,
		// 	spectator,
		// );
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
			handleRapidReanimation(playerBoard, playerEntity, opponentBoard, opponentEntity, this.gameState);
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
				simulateAttack(playerBoard, playerEntity, opponentBoard, opponentEntity, this.gameState);
			} else {
				simulateAttack(opponentBoard, opponentEntity, playerBoard, playerEntity, this.gameState);
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
					stringifySimple(playerBoard, this.gameState.allCards),
					'\n',
					stringifySimple(opponentBoard, this.gameState.allCards),
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
			this.gameState.spectator.registerOpponentAttack(playerBoard, opponentBoard, damage);
			return {
				result: 'lost',
				damageDealt: damage,
			};
		}
		const damage = this.buildBoardTotalDamage(playerBoard) + playerEntity.tavernTier;
		this.gameState.spectator.registerPlayerAttack(playerBoard, opponentBoard, damage);
		return {
			result: 'won',
			damageDealt: damage,
		};
	}

	private buildBoardTotalDamage(playerBoard: readonly BoardEntity[]): number {
		return playerBoard
			.map((entity) =>
				getEffectiveTechLevel(this.gameState.allCards.getCard(entity.cardId), this.gameState.allCards),
			)
			.reduce((a, b) => a + b, 0);
	}
}

export const handleRapidReanimation = (
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	if (playerEntity.rapidReanimationMinion) {
		handleRapidReanimationForPlayer(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	}
	if (opponentEntity.rapidReanimationMinion) {
		handleRapidReanimationForPlayer(opponentBoard, opponentEntity, playerBoard, playerEntity, gameState);
	}
};

const handleRapidReanimationForPlayer = (
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	gameState: FullGameState,
) => {
	if (playerBoard.length >= 7) {
		return;
	}
	const newMinion = buildSingleBoardEntity(
		playerEntity.rapidReanimationMinion.cardId,
		playerEntity,
		playerBoard,
		gameState.allCards,
		playerEntity.rapidReanimationMinion.friendly,
		gameState.sharedState.currentEntityId++,
		false,
		gameState.cardsData,
		gameState.sharedState,
		playerEntity.rapidReanimationMinion,
		null,
	);
	const indexFromRight = Math.min(playerBoard.length, playerEntity.rapidReanimationIndexFromRight ?? 0);
	// Don't reapply auras in this particular case? See https://x.com/ZerotoHeroes_HS/status/1737422727118487808?s=20
	performEntitySpawns(
		[newMinion],
		playerBoard,
		playerEntity,
		playerEntity,
		indexFromRight,
		opponentBoard,
		opponentEntity,
		gameState,
		false,
	);
	gameState.spectator.registerPowerTarget(playerEntity, newMinion, playerBoard, null, null);
	playerEntity.rapidReanimationMinion = null;
};
