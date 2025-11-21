import { GameTag, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { updateReborn } from '../../../keywords/reborn';
import { CardIds } from '../../../services/card-ids';
import { pickRandom } from '../../../services/utils';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { hasCorrectTribe, hasEntityMechanic } from '../../../utils';
import { StartOfCombatCard } from '../../card.interface';

export const Soulsplitter: StartOfCombatCard = {
	cardIds: [CardIds.Soulsplitter_BG25_023, CardIds.Soulsplitter_BG25_023_G],
	startOfCombatTiming: 'start-of-combat',
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const numberOfTargets = minion.cardId === CardIds.Soulsplitter_BG25_023_G ? 2 : 1;
		for (let i = 0; i < numberOfTargets; i++) {
			const undeadsWithoutReborn = input.playerBoard
				.filter(
					(e) =>
						hasCorrectTribe(
							e,
							input.playerEntity,
							Race.UNDEAD,
							input.gameState.anomalies,
							input.gameState.allCards,
						) && hasEntityMechanic(e, GameTag.REBORN, input.gameState.allCards),
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
