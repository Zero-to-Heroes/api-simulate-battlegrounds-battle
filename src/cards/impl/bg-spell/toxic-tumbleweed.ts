import { CardIds } from '../../../services/card-ids';
import { BoardSecret } from '../../../board-secret';
import { spawnEntities } from '../../../simulation/deathrattle-spawns';
import { performEntitySpawns } from '../../../simulation/spawns';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';

export const ToxicTumbleweed = {
	startOfCombat: (trinket: BoardSecret, input: SoCInput) => {
		if (input.playerBoard.length < 7) {
			const newMinions = spawnEntities(
				CardIds.ToxicTumbleweed_TumblingAssassinToken_BG28_641t,
				1,
				input.playerBoard,
				input.playerEntity,
				input.opponentBoard,
				input.opponentEntity,
				input.gameState,
				input.playerEntity.friendly,
				true,
				false,
				false,
			);
			newMinions[0].attackImmediately = true;
			performEntitySpawns(
				newMinions,
				input.playerBoard,
				input.playerEntity,
				null,
				0,
				input.opponentBoard,
				input.opponentEntity,
				input.gameState,
			);
			return { hasTriggered: true, shouldRecomputeCurrentAttacker: true };
		}
	},
};
