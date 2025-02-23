import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { StartOfCombatCard } from '../../card.interface';

export const PrizedPromoDrake: StartOfCombatCard = {
	cardIds: [CardIds.PrizedPromoDrake_BG21_014, CardIds.PrizedPromoDrake_BG21_014_G],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const mult = minion.cardId === CardIds.PrizedPromoDrake_BG21_014_G ? 2 : 1;
		const targets = input.playerBoard
			.filter((e) => e.entityId !== minion.entityId)
			.filter((e) =>
				hasCorrectTribe(
					e,
					input.playerEntity,
					Race.DRAGON,
					input.gameState.anomalies,
					input.gameState.allCards,
				),
			);
		if (!!targets.length) {
			for (const entity of targets) {
				modifyStats(entity, 3 * mult, 3 * mult, input.playerBoard, input.playerEntity, input.gameState);
				input.gameState.spectator.registerPowerTarget(
					minion,
					entity,
					input.playerBoard,
					input.playerEntity,
					input.opponentEntity,
				);
			}
			return true;
		}
	},
};
