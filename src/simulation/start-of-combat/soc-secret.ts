import { CardIds } from '@firestone-hs/reference-data';
import { BgsPlayerEntity } from '../../bgs-player-entity';
import { BoardEntity } from '../../board-entity';
import { pickRandom } from '../../services/utils';
import { addStatsToBoard } from '../../utils';
import { spawnEntities } from '../deathrattle-spawns';
import { FullGameState } from '../internal-game-state';
import { performEntitySpawns } from '../spawns';
import { handleSummonsWhenSpace } from '../summon-when-space';

export const handleStartOfCombatSecrets = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	gameState: FullGameState,
): number => {
	if (Math.random() < 0.5) {
		currentAttacker = handleStartOfCombatSecretsForPlayer(
			playerEntity,
			playerBoard,
			opponentEntity,
			opponentBoard,
			currentAttacker,
			gameState,
			true,
		);
		currentAttacker = handleStartOfCombatSecretsForPlayer(
			opponentEntity,
			opponentBoard,
			playerEntity,
			playerBoard,
			currentAttacker,
			gameState,
			false,
		);
	} else {
		currentAttacker = handleStartOfCombatSecretsForPlayer(
			opponentEntity,
			opponentBoard,
			playerEntity,
			playerBoard,
			currentAttacker,
			gameState,
			false,
		);
		currentAttacker = handleStartOfCombatSecretsForPlayer(
			playerEntity,
			playerBoard,
			opponentEntity,
			opponentBoard,
			currentAttacker,
			gameState,
			true,
		);
	}
	handleSummonsWhenSpace(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
	return currentAttacker;
};

const handleStartOfCombatSecretsForPlayer = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	gameState: FullGameState,
	playerIsFriendly: boolean,
): number => {
	if (playerEntity.startOfCombatDone) {
		return currentAttacker;
	}
	for (const secret of playerEntity.secrets ?? []) {
		switch (secret.cardId) {
			case CardIds.UpperHand_BG28_573:
				if (!!opponentBoard.length) {
					const target = pickRandom(opponentBoard);
					target.health = 1;
					target.maxHealth = 1;
					gameState.spectator.registerPowerTarget(playerEntity, target, opponentBoard, null, null);
				}
				break;
			case CardIds.BoonOfBeetles_BG28_603:
				secret.scriptDataNum1 = 1;
				break;
			case CardIds.FleetingVigor_BG28_519:
				addStatsToBoard(secret, playerBoard, playerEntity, 2, 1, gameState);
				break;
			case CardIds.ToxicTumbleweed_BG28_641:
				if (playerBoard.length < 7) {
					const newMinions = spawnEntities(
						CardIds.ToxicTumbleweed_TumblingAssassinToken_BG28_641t,
						1,
						playerBoard,
						playerEntity,
						opponentBoard,
						opponentEntity,
						gameState.allCards,
						gameState.cardsData,
						gameState.sharedState,
						gameState.spectator,
						playerEntity.friendly,
						true,
						false,
						false,
					);
					newMinions[0].attackImmediately = true;
					performEntitySpawns(
						newMinions,
						playerBoard,
						playerEntity,
						null,
						0,
						opponentBoard,
						opponentEntity,
						gameState,
					);
				}
				break;
		}
	}

	return currentAttacker;
};
