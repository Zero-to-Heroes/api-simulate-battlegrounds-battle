import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { updateReborn } from '../../../keywords/reborn';
import { CardIds } from '../../../services/card-ids';
import { pickMultipleRandom } from '../../../services/utils';
import { hasValidDeathrattle } from '../../../simulation/deathrattle-utils';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { hasCorrectTribe } from '../../../utils';
import { StartOfCombatCard } from '../../card.interface';

export const Soulsplitter: StartOfCombatCard = {
	cardIds: [CardIds.Soulsplitter_BG25_023, CardIds.Soulsplitter_BG25_023_G],
	startOfCombatTiming: 'start-of-combat',
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const numberOfTargets = minion.cardId === CardIds.Soulsplitter_BG25_023_G ? 2 : 1;
		const candidates = input.playerBoard.filter(
			(e) =>
				hasValidDeathrattle(e, input.playerEntity, input.gameState) &&
				!e.reborn &&
				hasCorrectTribe(
					e,
					input.playerEntity,
					Race.UNDEAD,
					input.gameState.anomalies,
					input.gameState.allCards,
				),
		);
		const targets = pickMultipleRandom(candidates, numberOfTargets);
		for (const target of targets) {
			updateReborn(target, true, input.playerBoard, input.playerEntity, input.opponentEntity, input.gameState);
			input.gameState.spectator.registerPowerTarget(
				minion,
				target,
				input.playerBoard,
				input.playerEntity,
				input.opponentEntity,
			);
		}
		return true;
	},
};
