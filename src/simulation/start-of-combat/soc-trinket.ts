import { BgsPlayerEntity } from '../../bgs-player-entity';
import { BoardEntity } from '../../board-entity';
import { FullGameState } from '../internal-game-state';
import { handleSummonsWhenSpace } from '../summon-when-space';
import { performStartOfCombatAction } from './soc-action-processor';
import { SoCInput } from './start-of-combat-input';

export const handleStartOfCombatTrinkets = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	gameState: FullGameState,
): number => {
	if (Math.random() < 0.5) {
		currentAttacker = handleStartOfCombatTrinketsForPlayer({
			playerEntity: playerEntity,
			playerBoard: playerBoard,
			opponentEntity: opponentEntity,
			opponentBoard: opponentBoard,
			currentAttacker,
			gameState,
			playerIsFriendly: true,
		});
		currentAttacker = handleStartOfCombatTrinketsForPlayer({
			playerEntity: opponentEntity,
			playerBoard: opponentBoard,
			opponentEntity: playerEntity,
			opponentBoard: playerBoard,
			currentAttacker,
			gameState,
			playerIsFriendly: false,
		});
	} else {
		currentAttacker = handleStartOfCombatTrinketsForPlayer({
			playerEntity: opponentEntity,
			playerBoard: opponentBoard,
			opponentEntity: playerEntity,
			opponentBoard: playerBoard,
			currentAttacker,
			gameState,
			playerIsFriendly: false,
		});
		currentAttacker = handleStartOfCombatTrinketsForPlayer({
			playerEntity: playerEntity,
			playerBoard: playerBoard,
			opponentEntity: opponentEntity,
			opponentBoard: opponentBoard,
			currentAttacker,
			gameState,
			playerIsFriendly: true,
		});
	}
	handleSummonsWhenSpace(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	return currentAttacker;
};

const handleStartOfCombatTrinketsForPlayer = (input: SoCInput): number => {
	if (input.playerEntity.startOfCombatDone) {
		return input.currentAttacker;
	}

	for (const trinket of input.playerEntity.trinkets) {
		performStartOfCombatAction(trinket.cardId, trinket, input);
	}

	return input.currentAttacker;
};
