import { CardIds } from '../../../services/card-ids';
import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { updateReborn } from '../../../keywords/reborn';
import { pickRandom } from '../../../services/utils';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { hasCorrectTribe } from '../../../utils';

export const Soulsplitter = {
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const numberOfTargets = minion.cardId === CardIds.Soulsplitter_BG25_023_G ? 2 : 1;
		for (let i = 0; i < numberOfTargets; i++) {
			const undeadsWithoutReborn = input.playerBoard
				.filter((e) =>
					hasCorrectTribe(
						e,
						input.playerEntity,
						Race.UNDEAD,
						input.gameState.anomalies,
						input.gameState.allCards,
					),
				)
				.filter((e) => !e.reborn);
			const chosenUndead = pickRandom(undeadsWithoutReborn);
			if (chosenUndead) {
				updateReborn(
					chosenUndead,
					true,
					input.playerBoard,
					input.playerEntity,
					input.opponentEntity,
					input.gameState,
				);
				input.gameState.spectator.registerPowerTarget(
					minion,
					chosenUndead,
					input.playerBoard,
					input.playerEntity,
					input.opponentEntity,
				);
			}
		}
		return true;
	},
};
