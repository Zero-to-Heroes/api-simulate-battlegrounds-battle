import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';

export const SanctumRester = {
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const buff = 10; //minion.cardId === CardIds.SanctumRester_BG26_356_G ? 20 : 10;
		// First try to get a target without divine shield, and if none is available, pick one with divine shield
		const dragons = input.playerBoard.filter((e) =>
			hasCorrectTribe(e, input.playerEntity, Race.DRAGON, input.gameState.anomalies, input.gameState.allCards),
		);
		dragons.forEach((otherDragon) => {
			modifyStats(otherDragon, minion, buff, 0, input.playerBoard, input.playerEntity, input.gameState);
		});
		return true;
	},
};
