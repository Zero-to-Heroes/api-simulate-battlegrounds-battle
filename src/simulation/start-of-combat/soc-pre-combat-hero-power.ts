import { CardIds } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../../bgs-player-entity';
import { BoardEntity } from '../../board-entity';
import { FullGameState } from '../internal-game-state';
import { handleSummonsWhenSpace } from '../summon-when-space';
import { performStartOfCombatAction } from './soc-action-processor';
import { SoCInput } from './start-of-combat-input';

export const handlePreCombatHeroPowers = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	gameState: FullGameState,
): number => {
	let initialPlayerBoardSize = playerBoard.length;
	let initialOpponentBoardSize = opponentBoard.length;
	const random = Math.random();
	if (random < 0.5) {
		currentAttacker = handlePreCombatHeroPowersForPlayer({
			playerEntity: playerEntity,
			playerBoard: playerBoard,
			opponentEntity: opponentEntity,
			opponentBoard: opponentBoard,
			currentAttacker,
			playerIsFriendly: true,
			gameState,
		});
		initialPlayerBoardSize = playerBoard.length;
		handleSummonsWhenSpace(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
		currentAttacker = handlePreCombatHeroPowersForPlayer({
			playerEntity: opponentEntity,
			playerBoard: opponentBoard,
			opponentEntity: playerEntity,
			opponentBoard: playerBoard,
			currentAttacker,
			playerIsFriendly: false,
			gameState,
		});
		initialOpponentBoardSize = opponentBoard.length;
		handleSummonsWhenSpace(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	} else {
		currentAttacker = handlePreCombatHeroPowersForPlayer({
			playerEntity: opponentEntity,
			playerBoard: opponentBoard,
			opponentEntity: playerEntity,
			opponentBoard: playerBoard,
			currentAttacker,
			playerIsFriendly: false,
			gameState,
		});
		initialOpponentBoardSize = opponentBoard.length;
		handleSummonsWhenSpace(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
		currentAttacker = handlePreCombatHeroPowersForPlayer({
			playerEntity: playerEntity,
			playerBoard: playerBoard,
			opponentEntity: opponentEntity,
			opponentBoard: opponentBoard,
			currentAttacker,
			playerIsFriendly: true,
			gameState,
		});
		initialPlayerBoardSize = playerBoard.length;
		handleSummonsWhenSpace(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	}
	// Ozumat's Tentaclecan cause the first player to be recomputed
	// https://replays.firestoneapp.com/?reviewId=f15c90de-8b3c-4017-960d-365fe09eb7ab&turn=5&action=1
	if (playerBoard.length !== initialPlayerBoardSize || opponentBoard.length !== initialOpponentBoardSize) {
		currentAttacker =
			playerBoard.length > opponentBoard.length
				? 0
				: opponentBoard.length > playerBoard.length
				? 1
				: Math.round(Math.random());
	}
	return currentAttacker;
};

const handlePreCombatHeroPowersForPlayer = (input: SoCInput): number => {
	const loops = input.playerEntity.trinkets?.some((t) => t.cardId === CardIds.ValdrakkenWindChimes_BG32_MagicItem_365)
		? 2
		: 1;
	for (let i = 0; i < loops; i++) {
		if (input.playerEntity.startOfCombatDone || input.playerEntity.hpLeft <= 0) {
			return input.currentAttacker;
		}

		for (const heroPower of input.playerEntity.heroPowers) {
			performStartOfCombatAction(heroPower.cardId, input.playerEntity, input, true, 'pre-combat');
		}
	}

	return input.currentAttacker;
};
