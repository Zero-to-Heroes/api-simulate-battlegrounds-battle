import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { shuffleArray } from '../../../services/utils';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { makeMinionGolden } from '../../../simulation/utils/golden';
import { isGolden } from '../../../utils';

export const YulonFortuneGranter = {
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const loops = minion.cardId === CardIds.YulonFortuneGranter_BG29_811_G ? 2 : 1;
		for (let i = 0; i < loops; i++) {
			const candidateBoard = input.playerBoard
				.filter((e) => !isGolden(e.cardId, input.gameState.allCards))
				.filter(
					(e) =>
						e.cardId !== CardIds.YulonFortuneGranter_BG29_811 &&
						e.cardId !== CardIds.YulonFortuneGranter_BG29_811_G,
				);
			// Because we pick one at random from all the ones that have the lowest tier
			const randomBoard = shuffleArray(candidateBoard);
			const candidates = randomBoard.sort(
				(a, b) =>
					input.gameState.cardsData.getTavernLevel(a.cardId) -
					input.gameState.cardsData.getTavernLevel(b.cardId),
			);
			const target = candidates[0];
			if (!!target) {
				makeMinionGolden(
					target,
					minion,
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
