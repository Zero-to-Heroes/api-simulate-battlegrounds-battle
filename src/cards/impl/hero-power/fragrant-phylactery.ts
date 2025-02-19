import { BoardTrinket } from '../../../bgs-player-entity';
import { pickRandomLowestHealth } from '../../../services/utils';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { StartOfCombatCard } from '../../card.interface';

export const FragrantPhylactery: StartOfCombatCard = {
	startOfCombatTiming: 'pre-combat',
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		for (const heroPower of input.playerEntity.heroPowers) {
			if (heroPower.used) {
				const chosenEntity = pickRandomLowestHealth(input.playerBoard);
				if (!chosenEntity) {
					console.warn('could not pick any entity for tamsin');
					return false;
				}

				input.gameState.spectator.registerPowerTarget(
					input.playerEntity,
					chosenEntity,
					input.playerBoard,
					null,
					null,
				);
				const newBoard = input.playerBoard.filter((e) => e.entityId !== chosenEntity.entityId);
				// How to mark the minion as dead
				chosenEntity.definitelyDead = true;
				newBoard.forEach((e) => {
					modifyStats(
						e,
						chosenEntity.attack,
						chosenEntity.health,
						newBoard,
						input.playerEntity,
						input.gameState,
					);
					input.gameState.spectator.registerPowerTarget(
						chosenEntity,
						e,
						newBoard,
						input.playerEntity,
						input.opponentEntity,
					);
				});
				// Tamsin's hero power somehow happens before the current attacker is chosen.
				// See http://replays.firestoneapp.com/?reviewId=bce94e6b-c807-48e4-9c72-2c5c04421213&turn=6&action=9
				// Even worse: if a scallywag token pops, it attacks before the first attacker is recomputed
				return { hasTriggered: true, shouldRecomputeCurrentAttacker: true };
			}
		}
	},
};
