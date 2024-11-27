import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { StartOfCombatCard } from '../../card.interface';

export const PrizedPromoDrake: StartOfCombatCard = {
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const stats = minion.cardId === CardIds.PrizedPromoDrake_BG21_014_G ? 6 : 3;
		const targets = input.playerBoard
			.filter((e) => e.entityId !== minion.entityId)
			.filter((e) => hasCorrectTribe(e, input.playerEntity, Race.DRAGON, input.gameState.allCards));
		if (!!targets.length) {
			for (const entity of targets) {
				modifyStats(entity, stats, stats, input.playerBoard, input.playerEntity, input.gameState);
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
