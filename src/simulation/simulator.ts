import { AllCardsService, CardIds, getEffectiveTechLevel } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { CardsData } from '../cards/cards-data';
import { SingleSimulationResult } from '../single-simulation-result';
import { stringifySimple } from '../utils';
import { simulateAttack } from './attack';
import { SharedState } from './shared-state';
import { Spectator } from './spectator/spectator';
import { handleStartOfCombat } from './start-of-combat';

// New simulator should be instantiated for each match
export class Simulator {
	private currentAttacker: number;
	private currentSpeedAttacker = -1;
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
		playerEntity: BgsPlayerEntity,
		opponentBoard: BoardEntity[],
		opponentEntity: BgsPlayerEntity,
		spectator: Spectator,
	): SingleSimulationResult {
		// Who attacks first is decided by the game before the hero power comes into effect. However, the full board (with the generated minion)
		// is sent tothe simulator
		const effectivePlayerBoardLength =
			playerEntity.heroPowerId === CardIds.NonCollectible.Neutral.EmbraceYourRageBattlegrounds && playerEntity.heroPowerUsed
				? playerBoard.length - 1
				: playerBoard.length;
		const effectiveOpponentBoardLength =
			opponentEntity.heroPowerId === CardIds.NonCollectible.Neutral.EmbraceYourRageBattlegrounds && opponentEntity.heroPowerUsed
				? opponentBoard.length - 1
				: opponentBoard.length;
		this.currentAttacker =
			effectivePlayerBoardLength > effectiveOpponentBoardLength
				? 0
				: effectiveOpponentBoardLength > effectivePlayerBoardLength
				? 1
				: Math.round(Math.random());
		this.sharedState.currentEntityId =
			Math.max(...playerBoard.map((entity) => entity.entityId), ...opponentBoard.map((entity) => entity.entityId)) + 1;
		if (this.sharedState.debug) {
			console.debug('before start of combat\n', stringifySimple(opponentBoard) + '\n', stringifySimple(playerBoard));
		}
		this.currentAttacker = handleStartOfCombat(
			playerEntity,
			playerBoard,
			opponentEntity,
			opponentBoard,
			this.currentAttacker,
			this.allCards,
			this.spawns,
			this.sharedState,
			spectator,
		);
		if (this.sharedState.debug) {
			console.debug('after start of combat\n', stringifySimple(opponentBoard) + '\n', stringifySimple(playerBoard));
		}
		let counter = 0;
		while (playerBoard.length > 0 && opponentBoard.length > 0) {
			if (this.sharedState.debug) {
				console.debug('starting round\n', stringifySimple(opponentBoard) + '\n', stringifySimple(playerBoard));
			}
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
			if (this.currentSpeedAttacker === 0 || (this.currentSpeedAttacker === -1 && this.currentAttacker === 0)) {
				simulateAttack(
					playerBoard,
					playerEntity,
					opponentBoard,
					opponentEntity,
					this.lastPlayerAttackerEntityId,
					this.allCards,
					this.spawns,
					this.sharedState,
					spectator,
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
					spectator,
				);
			}
			if (playerBoard.some((entity) => entity.attackImmediately)) {
				this.currentSpeedAttacker = 0;
			} else if (opponentBoard.some((entity) => entity.attackImmediately)) {
				this.currentSpeedAttacker = 1;
			} else {
				this.currentSpeedAttacker = -1;
				this.currentAttacker = (this.currentAttacker + 1) % 2;
			}
			counter++;
			if (counter > 200) {
				console.warn(
					'short-circuiting simulation, too many iterations',
					counter,
					'\n',
					stringifySimple(playerBoard),
					'\n',
					stringifySimple(opponentBoard),
				);
				return null;
			}
		}
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

	private buildBoardTotalDamage(playerBoard: readonly BoardEntity[]): number {
		return playerBoard
			.map((entity) => getEffectiveTechLevel(this.allCards.getCard(entity.cardId), this.allCards))
			.reduce((a, b) => a + b, 0);
	}
}
