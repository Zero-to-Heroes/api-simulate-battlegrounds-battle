import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { handleDeathrattles } from '../../../simulation/deathrattle-orchestration';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';

export const HawkstriderHerald = {
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const multiplier = minion.cardId === CardIds.HawkstriderHerald_BG27_079_G ? 2 : 1;
		for (const entity of input.playerBoard) {
			for (let i = 0; i < multiplier; i++) {
				input.gameState.spectator.registerPowerTarget(
					minion,
					entity,
					input.playerBoard,
					input.playerEntity,
					input.opponentEntity,
				);
				handleDeathrattles({
					gameState: input.gameState,
					playerDeadEntities: input.playerEntity.friendly ? [entity] : [],
					playerDeadEntityIndexesFromRight: input.playerEntity.friendly
						? [input.playerBoard.length - 1 - input.playerBoard.indexOf(entity)]
						: [],
					opponentDeadEntities: input.playerEntity.friendly ? [] : [entity],
					opponentDeadEntityIndexesFromRight: input.playerEntity.friendly
						? []
						: [input.playerBoard.length - 1 - input.playerBoard.indexOf(entity)],
				});
			}
		}
		return true;
	},
};
