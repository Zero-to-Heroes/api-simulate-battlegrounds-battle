import { CardIds } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../../bgs-player-entity';
import { BoardEntity } from '../../board-entity';
import { FullGameState } from '../internal-game-state';
import { handleSummonsWhenSpace } from '../summon-when-space';
import { performStartOfCombatAction } from './soc-action-processor';
import { SoCInput } from './start-of-combat-input';

export const handleStartOfCombatSecrets = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	gameState: FullGameState,
): number => {
	if (Math.random() < 0.5) {
		currentAttacker = handleStartOfCombatSecretsForPlayer({
			playerEntity: playerEntity,
			playerBoard: playerBoard,
			opponentEntity: opponentEntity,
			opponentBoard: opponentBoard,
			currentAttacker,
			gameState,
			playerIsFriendly: true,
		});
		currentAttacker = handleStartOfCombatSecretsForPlayer({
			playerEntity: opponentEntity,
			playerBoard: opponentBoard,
			opponentEntity: playerEntity,
			opponentBoard: playerBoard,
			currentAttacker,
			gameState,
			playerIsFriendly: false,
		});
	} else {
		currentAttacker = handleStartOfCombatSecretsForPlayer({
			playerEntity: opponentEntity,
			playerBoard: opponentBoard,
			opponentEntity: playerEntity,
			opponentBoard: playerBoard,
			currentAttacker,
			gameState,
			playerIsFriendly: false,
		});
		currentAttacker = handleStartOfCombatSecretsForPlayer({
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

const handleStartOfCombatSecretsForPlayer = (input: SoCInput): number => {
	const loops = input.playerEntity.trinkets?.some((t) => t.cardId === CardIds.ValdrakkenWindChimes_BG32_MagicItem_365)
		? 2
		: 1;
	for (let i = 0; i < loops; i++) {
		if (input.playerEntity.startOfCombatDone) {
			return input.currentAttacker;
		}
		for (const secret of input.playerEntity.secrets ?? []) {
			performStartOfCombatAction(secret.cardId, secret, input, false);
		}
	}
	return input.currentAttacker;
};
