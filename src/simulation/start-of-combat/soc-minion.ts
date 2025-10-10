import { BgsPlayerEntity } from '../../bgs-player-entity';
import { BoardEntity } from '../../board-entity';
import { hasStartOfCombatFromHand } from '../../cards/card.interface';
import { cardMappings } from '../../cards/impl/_card-mappings';
import { CardIds } from '../../services/card-ids';
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
		// Hand triggers first
		...playerEntity.hand.filter((e) => hasStartOfCombatFromHand(cardMappings[e.cardId])),
		...playerBoard,
	];
	const opponentAttackers = [
		...opponentEntity.hand.filter((e) => hasStartOfCombatFromHand(cardMappings[e.cardId])),
		...opponentBoard,
	];

	while (playerAttackers.length > 0 || opponentAttackers.length > 0) {
		let shouldUpdateNextPlayer = false;
		if (attackerForStart === 0 && playerAttackers.length > 0) {
			const attacker = playerAttackers.splice(0, 1)[0];
			if (attacker.health <= 0 || attacker.definitelyDead) {
				continue;
			}
			const input = {
				playerBoard: playerBoard,
				playerEntity: playerEntity,
				opponentBoard: opponentBoard,
				opponentEntity: opponentEntity,
				playerBoardBefore: playerBoardBefore,
				opponentBoardBefore: opponentBoardBefore,
				playerIsFriendly: true,
				currentAttacker: currentAttacker,
				gameState,
			};
			shouldUpdateNextPlayer = performStartOfCombatMinionsForPlayer(attacker, input);
			currentAttacker = input.currentAttacker;
		} else if (attackerForStart === 0 && playerAttackers.length === 0) {
			shouldUpdateNextPlayer = true;
		} else if (attackerForStart === 1 && opponentAttackers.length > 0) {
			const attacker = opponentAttackers.splice(0, 1)[0];
			if (attacker.health <= 0 || attacker.definitelyDead) {
				continue;
			}
			const input = {
				playerBoard: opponentBoard,
				playerEntity: opponentEntity,
				opponentBoard: playerBoard,
				opponentEntity: playerEntity,
				playerBoardBefore: opponentBoardBefore,
				opponentBoardBefore: playerBoardBefore,
				playerIsFriendly: false,
				currentAttacker: currentAttacker,
				gameState,
			};
			shouldUpdateNextPlayer = performStartOfCombatMinionsForPlayer(attacker, input);
			currentAttacker = input.currentAttacker;
		} else if (attackerForStart === 1 && opponentAttackers.length === 0) {
			shouldUpdateNextPlayer = true;
		}

		if (shouldUpdateNextPlayer) {
			attackerForStart = (attackerForStart + 1) % 2;
		}
	}
	const shouldRecomputeCurrentAttacker = handleSummonsWhenSpace(
		playerBoard,
		playerEntity,
		opponentBoard,
		opponentEntity,
		gameState,
	);
	if (shouldRecomputeCurrentAttacker) {
		currentAttacker =
			playerBoard.length > opponentBoard.length
				? 0
				: opponentBoard.length > playerBoard.length
				? 1
				: Math.round(Math.random());
	}
	return currentAttacker;
};

// Apparently, the board composition used for start of combat minion effects (like Red Whelp, and I assume it works the
// same way for others like Prized Promo Drake or Mantid Queen) is the one that is used before Illidan's effect is handled.
// Since this also runs before HP start of combat, we probably also use the state as it was before HP were triggered, like
// Tamsin's Phylactery.
export const performStartOfCombatMinionsForPlayer = (minion: BoardEntity, input: SoCInput): boolean => {
	const loops = input.playerEntity.trinkets?.some((t) => t.cardId === CardIds.ValdrakkenWindChimes_BG32_MagicItem_365)
		? 2
		: 1;
	let hasProcessed = false;
	for (let i = 0; i < loops; i++) {
		if (input.playerEntity.startOfCombatDone) {
			return false;
		}

		hasProcessed = performStartOfCombatAction(minion.cardId, minion, input, true) || hasProcessed;
	}
	return hasProcessed;
};
