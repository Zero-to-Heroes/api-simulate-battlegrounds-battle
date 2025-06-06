import { CardIds } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../../bgs-player-entity';
import { BoardEntity } from '../../board-entity';
import { processMinionDeath, simulateAttack } from '../attack';
import { FullGameState } from '../internal-game-state';
import { modifyStats } from '../stats';
import { handleSummonsWhenSpace } from '../summon-when-space';

export const handleIllidanHeroPowers = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	gameState: FullGameState,
): number => {
	// console.log('current attacker before', currentAttacker);
	// Apparently it's a toin coss about whether to handle Illidan first or Al'Akir first
	// Auras are only relevant for Illidan, and already applied there
	if (Math.random() < 0.5) {
		currentAttacker = handlePlayerIllidanHeroPowers(
			playerEntity,
			playerBoard,
			opponentEntity,
			opponentBoard,
			currentAttacker,
			true,
			gameState,
		);
		currentAttacker = handlePlayerIllidanHeroPowers(
			opponentEntity,
			opponentBoard,
			playerEntity,
			playerBoard,
			currentAttacker,
			false,
			gameState,
		);
	} else {
		currentAttacker = handlePlayerIllidanHeroPowers(
			opponentEntity,
			opponentBoard,
			playerEntity,
			playerBoard,
			currentAttacker,
			false,
			gameState,
		);
		currentAttacker = handlePlayerIllidanHeroPowers(
			playerEntity,
			playerBoard,
			opponentEntity,
			opponentBoard,
			currentAttacker,
			true,
			gameState,
		);
	}
	processMinionDeath(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	handleSummonsWhenSpace(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	return currentAttacker;
};

const handlePlayerIllidanHeroPowers = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	friendly: boolean,
	gameState: FullGameState,
): number => {
	const loops = playerEntity.trinkets?.some((t) => t.cardId === CardIds.ValdrakkenWindChimes_BG32_MagicItem_365)
		? 2
		: 1;
	for (let i = 0; i < loops; i++) {
		if (playerEntity.hpLeft <= 0) {
			return currentAttacker;
		}
		for (const heroPower of playerEntity.heroPowers) {
			if (heroPower.cardId === CardIds.Wingmen && playerBoard.length > 0) {
				// After Illidan triggers, it's always the other opponent's turn
				// https://x.com/LoewenMitchell/status/1752714583360639131?s=20
				handleIllidanForPlayer(
					playerBoard,
					playerEntity,
					opponentBoard,
					opponentEntity,
					gameState,
					currentAttacker,
				);
				// This is not true anymore: https://replays.firestoneapp.com/?reviewId=7282387d-66cd-458e-8ee1-e04c662e7bad&turn=5&action=1
				// currentAttacker = friendly ? 1 : 0;
				// In fact there is some adjustment going on: https://replays.firestoneapp.com/?reviewId=929f676f-47f6-494b-9619-df04174a0150&turn=11&action=0
				// So trying another logic
				// currentAttacker = (currentAttacker + 1) % 2;
				// This isn't correct. The following game is a case of:
				// The player with the fewer minions is Illidan, so isn't the "first attacker"
				// Wingmen triggers
				// The non-Illidan side then attacks first
				// https://replays.firestoneapp.com/?reviewId=45f40e73-4be9-419f-9093-0c2d91a7bac2&turn=5&action=0
				// So for now, just randomizing the attacker to try and avoid "impossible" scenarios as much as possible
				currentAttacker = Math.random() < 0.5 ? 0 : 1;
			}
		}
	}
	return currentAttacker;
};

// TODO: not exactly correct, because of "attack immediately", but it's close enough
const handleIllidanForPlayer = (
	playerBoard: BoardEntity[],
	playerEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	gameState: FullGameState,
	currentAttacker: number,
): void => {
	if (playerEntity.startOfCombatDone) {
		return;
	}
	// Otherwise, if the first minion dies on the attack, and the board has only 2 minions, we
	// miss the second one
	const minionsAtStart = playerBoard.length;
	const firstAttacker = playerBoard[0];
	const secondAttacker = minionsAtStart > 1 ? playerBoard[playerBoard.length - 1] : null;

	// Stats updates
	modifyStats(firstAttacker, playerEntity, 2, 1, playerBoard, playerEntity, gameState);
	if (!!secondAttacker && !secondAttacker.definitelyDead && secondAttacker.health > 0) {
		modifyStats(secondAttacker, playerEntity, 2, 1, playerBoard, playerEntity, gameState);
	}

	// Attacks
	firstAttacker.attackImmediately = true;
	simulateAttack(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	// See http://replays.firestoneapp.com/?reviewId=f16b7a49-c2a2-4ac5-a9eb-a75f83246f70&turn=6&action=8
	firstAttacker.hasAttacked = 0;
	if (!!secondAttacker && !secondAttacker.definitelyDead && secondAttacker.health > 0) {
		secondAttacker.attackImmediately = true;
		simulateAttack(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
		secondAttacker.hasAttacked = 0;
	}

	// // See http://replays.firestoneapp.com/?reviewId=7e9ec42c-a8f6-43d2-9f39-cc486dfa2395&turn=6&action=5
	// if (firstAttacker.definitelyDead || firstAttacker.health <= 0) {
	// 	currentAttacker = (currentAttacker + 1) % 2;
	// }
	// return currentAttacker;
};
