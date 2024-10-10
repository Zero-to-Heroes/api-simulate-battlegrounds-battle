import { BgsPlayerEntity } from '../../bgs-player-entity';
import { BoardEntity } from '../../board-entity';
import { processMinionDeath } from '../attack';
import { FullGameState } from '../internal-game-state';
import { handleSummonsWhenSpace } from '../summon-when-space';
import { performStartOfCombatAction } from './soc-action-processor';
import { getHeroPowerForHero } from './soc-hero-power';
import { SoCInput } from './start-of-combat-input';

export const handlePreCombatHeroPowers = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	gameState: FullGameState,
): number => {
	if (Math.random() < 0.5) {
		currentAttacker = handlePreCombatHeroPowersForPlayer({
			playerEntity: playerEntity,
			playerBoard: playerBoard,
			opponentEntity: opponentEntity,
			opponentBoard: opponentBoard,
			currentAttacker,
			playerIsFriendly: true,
			gameState,
		});
		currentAttacker = handlePreCombatHeroPowersForPlayer({
			playerEntity: opponentEntity,
			playerBoard: opponentBoard,
			opponentEntity: playerEntity,
			opponentBoard: playerBoard,
			currentAttacker,
			playerIsFriendly: false,
			gameState,
		});
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
		currentAttacker = handlePreCombatHeroPowersForPlayer({
			playerEntity: playerEntity,
			playerBoard: playerBoard,
			opponentEntity: opponentEntity,
			opponentBoard: opponentBoard,
			currentAttacker,
			playerIsFriendly: true,
			gameState,
		});
	}
	const initialPlayerBoardSize = playerBoard.length;
	const initialOpponentBoardSize = opponentBoard.length;
	// Ozumat's Tentaclecan cause the first player to be recomputed
	// https://replays.firestoneapp.com/?reviewId=f15c90de-8b3c-4017-960d-365fe09eb7ab&turn=5&action=1
	handleSummonsWhenSpace(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);

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
	if (input.playerEntity.startOfCombatDone || input.playerEntity.hpLeft <= 0) {
		return input.currentAttacker;
	}

	const playerHeroPowerId = input.playerEntity.heroPowerId || getHeroPowerForHero(input.playerEntity.cardId);
	performStartOfCombatAction(playerHeroPowerId, input.playerEntity, input);
	processMinionDeath(
		input.playerBoard,
		input.playerEntity,
		input.opponentBoard,
		input.opponentEntity,
		input.gameState,
	);

	return input.currentAttacker;
};
