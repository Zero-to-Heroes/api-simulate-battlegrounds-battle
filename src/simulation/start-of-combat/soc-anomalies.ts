import { BgsPlayerEntity } from '../../bgs-player-entity';
import { BoardEntity } from '../../board-entity';
import { FullGameState } from '../internal-game-state';
import { handleSummonsWhenSpace } from '../summon-when-space';
import { performStartOfCombatAction } from './soc-action-processor';
import { SoCInput } from './start-of-combat-input';

export const handleStartOfCombatAnomalies = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	gameState: FullGameState,
): number => {
	currentAttacker = handleStartOfCombatAnomaliesForPlayer({
		playerEntity: playerEntity,
		playerBoard: playerBoard,
		opponentEntity: opponentEntity,
		opponentBoard: opponentBoard,
		currentAttacker,
		gameState,
		playerIsFriendly: true,
	});
	currentAttacker = handleStartOfCombatAnomaliesForPlayer({
		playerEntity: opponentEntity,
		playerBoard: opponentBoard,
		opponentEntity: playerEntity,
		opponentBoard: playerBoard,
		currentAttacker,
		gameState,
		playerIsFriendly: false,
	});
	handleSummonsWhenSpace(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	return currentAttacker;
};

const handleStartOfCombatAnomaliesForPlayer = (input: SoCInput): number => {
	if (!input.gameState.anomalies?.length || input.playerEntity.startOfCombatDone) {
		return input.currentAttacker;
	}

	for (const anomaly of input.gameState.anomalies) {
		performStartOfCombatAction(anomaly, input.playerEntity, input);
	}

	return input.currentAttacker;
};
