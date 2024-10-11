import { BoardTrinket } from '../../../bgs-player-entity';
import { BoardEntity } from '../../../board-entity';
import { shuffleArray } from '../../../services/utils';
import { spawnEntities } from '../../../simulation/deathrattle-spawns';
import { performEntitySpawns } from '../../../simulation/spawns';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { addImpliedMechanics, getTeammateInitialState } from '../../../utils';

export const SummoningSphere = {
	startOfCombat: (trinket: BoardTrinket, input: SoCInput) => {
		const teammateState = getTeammateInitialState(input.gameState.gameState, input.playerEntity);
		if (!teammateState?.board?.length) {
			return;
		}
		const highestHealthMinion = shuffleArray([...teammateState.board]).sort((a, b) => b.health - a.health)[0];
		const clone: BoardEntity = addImpliedMechanics(
			{
				...highestHealthMinion,
				lastAffectedByEntity: null,
				definitelyDead: false,
				attackImmediately: false,
			},
			input.gameState.cardsData,
		);
		const newMinions = spawnEntities(
			clone.cardId,
			1,
			input.playerBoard,
			input.playerEntity,
			input.opponentBoard,
			input.opponentEntity,
			input.gameState.allCards,
			input.gameState.cardsData,
			input.gameState.sharedState,
			input.gameState.spectator,
			highestHealthMinion.friendly,
			true,
			false,
			false,
			clone,
		);
		const indexFromRight = 0;
		const spawned = performEntitySpawns(
			newMinions,
			input.playerBoard,
			input.playerEntity,
			highestHealthMinion,
			indexFromRight,
			input.opponentBoard,
			input.opponentEntity,
			input.gameState,
		);
		if (spawned.length > 0) {
			input.gameState.spectator.registerPowerTarget(
				input.playerEntity,
				clone,
				input.playerBoard,
				input.playerEntity,
				input.opponentEntity,
			);
			return { hasTriggered: true, shouldRecomputeCurrentAttacker: true };
		}
	},
};
