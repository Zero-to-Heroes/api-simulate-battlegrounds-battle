import { BgsPlayerEntity } from '../../bgs-player-entity';
import { BoardEntity } from '../../board-entity';
import { processMinionDeath } from '../attack';
import { FullGameState } from '../internal-game-state';
import { performStartOfCombatAction } from './soc-action-processor';
import { SoCInput } from './start-of-combat-input';

export const handleStartOfCombatMinions = (
	playerEntity: BgsPlayerEntity,
	playerBoard: BoardEntity[],
	opponentEntity: BgsPlayerEntity,
	opponentBoard: BoardEntity[],
	currentAttacker: number,
	playerBoardBefore: BoardEntity[],
	opponentBoardBefore: BoardEntity[],
	gameState: FullGameState,
): number => {
	let attackerForStart = Math.random() < 0.5 ? 0 : 1;
	const playerAttackers = [...playerBoard];
	const opponentAttackers = [...opponentBoard];

	while (playerAttackers.length > 0 || opponentAttackers.length > 0) {
		let shouldUpdateNextPlayer = false;
		if (attackerForStart === 0 && playerAttackers.length > 0) {
			const attacker = playerAttackers.splice(0, 1)[0];
			if (attacker.health <= 0 || attacker.definitelyDead) {
				continue;
			}
			shouldUpdateNextPlayer = performStartOfCombatMinionsForPlayer(attacker, {
				playerBoard,
				playerEntity,
				opponentBoard,
				opponentEntity,
				playerBoardBefore,
				opponentBoardBefore,
				playerIsFriendly: true,
				currentAttacker: 0,
				gameState,
			});
		} else if (attackerForStart === 0 && playerAttackers.length === 0) {
			shouldUpdateNextPlayer = true;
		} else if (attackerForStart === 1 && opponentAttackers.length > 0) {
			const attacker = opponentAttackers.splice(0, 1)[0];
			if (attacker.health <= 0 || attacker.definitelyDead) {
				continue;
			}
			shouldUpdateNextPlayer = performStartOfCombatMinionsForPlayer(attacker, {
				opponentBoard,
				opponentEntity,
				playerBoard,
				playerEntity,
				opponentBoardBefore,
				playerBoardBefore,
				playerIsFriendly: false,
				currentAttacker: 0,
				gameState,
			});
		} else if (attackerForStart === 1 && opponentAttackers.length === 0) {
			shouldUpdateNextPlayer = true;
		}

		if (shouldUpdateNextPlayer) {
			attackerForStart = (attackerForStart + 1) % 2;
		}
	}
	return currentAttacker;
};

// Apparently, the board composition used for start of combat minion effects (like Red Whelp, and I assume it works the
// same way for others like Prized Promo Drake or Mantid Queen) is the one that is used before Illidan's effect is handled.
// Since this also runs before HP start of combat, we probably also use the state as it was before HP were triggered, like
// Tamsin's Phylactery.
export const performStartOfCombatMinionsForPlayer = (minion: BoardEntity, input: SoCInput): boolean => {
	if (input.playerEntity.startOfCombatDone) {
		return false;
	}

	const hasProcessed = performStartOfCombatAction(minion.cardId, minion, input);

	processMinionDeath(
		input.playerBoard,
		input.playerEntity,
		input.opponentBoard,
		input.opponentEntity,
		input.gameState,
	);
	return hasProcessed;
};