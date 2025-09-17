import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { makeMinionGolden } from '../../../simulation/utils/golden';
import { getRandomMinionWithHighestHealth, getTeammateInitialState } from '../../../utils';

export const Sandy = {
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const teammateState = getTeammateInitialState(input.gameState.gameState, input.playerEntity);
		if (teammateState?.board?.length) {
			const isGolden = minion.cardId === CardIds.Sandy_BGDUO_125_G;
			const minionToCopy = getRandomMinionWithHighestHealth(teammateState.board);
			const copy: BoardEntity = { ...minionToCopy, enchantments: [...minionToCopy.enchantments] };
			const attackerIndex = input.playerBoard.indexOf(minion);
			// Insert the copy in its place
			input.playerBoard.splice(attackerIndex, 1, copy);
			if (isGolden) {
				makeMinionGolden(
					copy,
					copy,
					input.playerBoard,
					input.playerEntity,
					input.opponentBoard,
					input.opponentEntity,
					input.gameState,
				);
			}
		}
		return true;
	},
};
