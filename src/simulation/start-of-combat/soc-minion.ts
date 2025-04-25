import { BgsPlayerEntity } from '../../bgs-player-entity';
import { BoardEntity } from '../../board-entity';
import { hasStartOfCombatFromHand } from '../../cards/card.interface';
import { cardMappings } from '../../cards/impl/_card-mappings';
import { FullGameState } from '../internal-game-state';
import { handleSummonsWhenSpace } from '../summon-when-space';
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
	const playerAttackers = [
		...playerBoard,
		...playerEntity.hand.filter((e) => hasStartOfCombatFromHand(cardMappings[e.cardId])),
	];
	const opponentAttackers = [
		...opponentBoard,
		...playerEntity.hand.filter((e) => hasStartOfCombatFromHand(cardMappings[e.cardId])),
	];

	while (playerAttackers.length > 0 || opponentAttackers.length > 0) {
		let shouldUpdateNextPlayer = false;
		if (attackerForStart === 0 && playerAttackers.length > 0) {
			const attacker = playerAttackers.splice(0, 1)[0];
			if (attacker.health <= 0 || attacker.definitelyDead) {
				continue;
			}
			shouldUpdateNextPlayer = performStartOfCombatMinionsForPlayer(attacker, {
				playerBoard: playerBoard,
				playerEntity: playerEntity,
				opponentBoard: opponentBoard,
				opponentEntity: opponentEntity,
				playerBoardBefore: playerBoardBefore,
				opponentBoardBefore: opponentBoardBefore,
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
				playerBoard: opponentBoard,
				playerEntity: opponentEntity,
				opponentBoard: playerBoard,
				opponentEntity: playerEntity,
				playerBoardBefore: opponentBoardBefore,
				opponentBoardBefore: playerBoardBefore,
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
	handleSummonsWhenSpace(playerBoard, playerEntity, opponentBoard, opponentEntity, gameState);
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

	const hasProcessed = performStartOfCombatAction(minion.cardId, minion, input, true);
	return hasProcessed;
};
