import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';

export const SanctumRester = {
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const buff = minion.cardId === CardIds.SanctumRester_BG26_356_G ? 16 : 8;
		// First try to get a target without divine shield, and if none is available, pick one with divine shield
		const otherDragons = input.playerBoard
			.filter((e) =>
				hasCorrectTribe(
					e,
					input.playerEntity,
					Race.DRAGON,
					input.gameState.anomalies,
					input.gameState.allCards,
				),
			)
			.filter((e) => e.entityId !== minion.entityId);
		otherDragons.forEach((otherDragon) => {
			modifyStats(otherDragon, 0, buff, input.playerBoard, input.playerEntity, input.gameState);
			input.gameState.spectator.registerPowerTarget(
				minion,
				otherDragon,
				input.playerBoard,
				input.playerEntity,
				input.opponentEntity,
			);
		});
		return true;
	},
};
