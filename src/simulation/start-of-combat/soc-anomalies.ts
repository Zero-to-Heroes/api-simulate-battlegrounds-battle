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
		playerEntity,
		playerBoard,
		opponentEntity,
		opponentBoard,
		currentAttacker,
		gameState,
		playerIsFriendly: true,
	});
	currentAttacker = handleStartOfCombatAnomaliesForPlayer({
		opponentEntity,
		opponentBoard,
		playerEntity,
		playerBoard,
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
		performStartOfCombatAction(anomaly, null, input);
	}

	return input.currentAttacker;
};
