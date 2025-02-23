import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { updateWindfury } from '../../../keywords/windfury';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';

export const ThousandthPaperDrake = {
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const loops = minion.cardId === CardIds.ThousandthPaperDrake_BG29_810_G ? 2 : 1;
		const pickedTargets = [];
		const dragons = input.playerBoard.filter((e) =>
			hasCorrectTribe(e, input.playerEntity, Race.DRAGON, input.gameState.anomalies, input.gameState.allCards),
		);
		for (let i = 0; i < loops; i++) {
			const target = dragons.filter((e) => !pickedTargets.includes(e))[0];
			if (!!target) {
				modifyStats(target, 1, 2, input.playerBoard, input.playerEntity, input.gameState);
				updateWindfury(
					minion,
					true,
					input.playerBoard,
					input.playerEntity,
					input.opponentEntity,
					input.gameState,
				);
				input.gameState.spectator.registerPowerTarget(
					minion,
					target,
					input.playerBoard,
					input.playerEntity,
					input.opponentEntity,
				);
				pickedTargets.push(target);
			}
		}
		return true;
	},
};
