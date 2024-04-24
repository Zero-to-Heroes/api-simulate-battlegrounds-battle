import { getEffectiveTechLevel } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../bgs-player-entity';
import { BoardEntity } from '../board-entity';
import { SingleSimulationResult } from '../single-simulation-result';
import { stringifySimple } from '../utils';
import { simulateAttack } from './attack';
import { clearStealthIfNeeded } from './auras';
import { FullGameState, PlayerState } from './internal-game-state';
import { handleStartOfCombat } from './start-of-combat';
import { handleSummonWhenSpace as handleSummonsWhenSpace } from './summon-when-space';

// New simulator should be instantiated for each match
export class Simulator {
	private currentAttacker: number;
	private currentSpeedAttacker = -1;

	// It should come already initialized
	constructor(private readonly gameState: FullGameState) {}

	// Here we suppose that the BoardEntity only contain at most the enchantments that are linked
	// to auras (so we probably should hand-filter that, since there are actually few auras)
	public simulateSingleBattle(playerState: PlayerState, opponentState: PlayerState): SingleSimulationResult {
		let playerBoard: BoardEntity[] = playerState.board;
		let playerEntity: BgsPlayerEntity = playerState.player;
		let opponentBoard: BoardEntity[] = opponentState.board;
		let opponentEntity: BgsPlayerEntity = opponentState.player;
		while (
			!playerEntity.startOfCombatDone ||
			!opponentEntity.startOfCombatDone ||
			(playerBoard?.length > 0 && opponentBoard?.length > 0)
		) {
			this.simulateSingleBattlePass(playerBoard, playerEntity, opponentBoard, opponentEntity);

			// The only case where there can only 0-attack minions on a board is when both boards
			// are that way (otherwise one side would kill the other)
			const areBothBoards0Attack =
				playerState.board.length > 0 &&
				playerState.board.every((entity) => entity.attack === 0) &&
				opponentState.board.length > 0 &&
				opponentState.board.every((entity) => entity.attack === 0);
			const isPlayerBoardEmpty = playerState.board.length === 0;
			const isOpponentBoardEmpty = opponentState.board.length === 0;
			playerBoard = areBothBoards0Attack || isPlayerBoardEmpty ? playerState.teammate?.board : playerState.board;
			playerEntity =
				areBothBoards0Attack || isPlayerBoardEmpty ? playerState.teammate?.player : playerState.player;
			opponentBoard =
				areBothBoards0Attack || isOpponentBoardEmpty ? opponentState.teammate?.board : opponentState.board;
			opponentEntity =
				areBothBoards0Attack || isOpponentBoardEmpty ? opponentState.teammate?.player : opponentState.player;
			// So that gameState.player always refers to the active player
			if (isPlayerBoardEmpty) {
				this.gameState.gameState.player.teammate = {
					board: this.gameState.gameState.player.board,
					player: this.gameState.gameState.player.player,
				};
				this.gameState.gameState.player.player = playerEntity;
				this.gameState.gameState.player.board = playerBoard;
			}
			if (isOpponentBoardEmpty) {
				this.gameState.gameState.opponent.teammate = {
					board: this.gameState.gameState.opponent.board,
					player: this.gameState.gameState.opponent.player,
				};
				this.gameState.gameState.opponent.player = opponentEntity;
				this.gameState.gameState.opponent.board = opponentBoard;
			}

			if (!playerEntity || !opponentEntity) {
				break;
			}
		}

		if (
			(!playerBoard?.length && !opponentBoard?.length) ||
			// E.g. when both players have a 0-attack minion
			(playerBoard?.length > 0 && opponentBoard?.length > 0)
		) {
			return {
				result: 'tied',
			} as SingleSimulationResult;
		}
		if (!playerBoard?.length) {
			const damage =
				this.buildBoardTotalDamage(opponentBoard, this.gameState.gameState.opponent?.teammate?.board) +
				opponentEntity.tavernTier;
			this.gameState.spectator.registerOpponentAttack(playerBoard, opponentBoard, damage);
			return {
				result: 'lost',
				damageDealt: damage,
			};
		}
		const damage =
			this.buildBoardTotalDamage(playerBoard, this.gameState.gameState.player?.teammate?.board) +
			playerEntity.tavernTier;
		this.gameState.spectator.registerPlayerAttack(playerBoard, opponentBoard, damage);
		return {
			result: 'won',
			damageDealt: damage,
		};
	}

	private simulateSingleBattlePass(
		playerBoard: BoardEntity[],
		playerEntity: BgsPlayerEntity,
		opponentBoard: BoardEntity[],
		opponentEntity: BgsPlayerEntity,
	) {
		// Start of combat happens only once, so we need to flag whether it has already happened for a
		// given player
		this.gameState.spectator.registerStartOfCombat(playerBoard, opponentBoard, playerEntity, opponentEntity);

		// Who attacks first is decided by the game before the hero power comes into effect. However, the full board (with the generated minion)
		// is sent tothe simulator
		// But in fact, the first player decision takes into account that additional minion. See
		// https://replays.firestoneapp.com/?reviewId=ddbbbe93-464b-4400-8e8d-4abca8680a2e
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
				...(playerEntity.hand?.map((entity) => entity.entityId) ?? []),
				...(opponentEntity.hand?.map((entity) => entity.entityId) ?? []),
			) + 1;
		const suggestedNewCurrentAttacker = handleStartOfCombat(
			playerEntity,
			playerBoard,
			opponentEntity,
			opponentBoard,
			this.currentAttacker,
			this.gameState,
		);
		this.currentAttacker = suggestedNewCurrentAttacker;
		let counter = 0;
		while (playerBoard.length > 0 && opponentBoard.length > 0) {
			handleSummonsWhenSpace(playerBoard, playerEntity, opponentBoard, opponentEntity, this.gameState);
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
	}

	private buildBoardTotalDamage(playerBoard: readonly BoardEntity[], teammateBoard?: BoardEntity[]): number {
		const damageFromPlayerBoard = playerBoard
			.map((entity) =>
				getEffectiveTechLevel(this.gameState.allCards.getCard(entity.cardId), this.gameState.allCards),
			)
			.reduce((a, b) => a + b, 0);
		const numberOfTeamateMinionsToSummnon = 7 - playerBoard.length;
		const damageFromTeammateBoard =
			teammateBoard
				?.slice(0, numberOfTeamateMinionsToSummnon)
				.map((entity) =>
					getEffectiveTechLevel(this.gameState.allCards.getCard(entity.cardId), this.gameState.allCards),
				)
				.reduce((a, b) => a + b, 0) ?? 0;
		return damageFromPlayerBoard + damageFromTeammateBoard;
	}
}
