import { BoardEntity } from '../../../board-entity';
import { shuffleArray } from '../../../services/utils';
import { SoCInput } from '../../../simulation/start-of-combat/start-of-combat-input';
import { makeMinionGolden } from '../../../simulation/utils/golden';
import { TempCardIds } from '../../../temp-card-ids';
import { isGolden } from '../../../utils';
import { StartOfCombatCard } from '../../card.interface';

export const YulonSticker: StartOfCombatCard = {
	cardIds: [TempCardIds.YulonSticker],
	startOfCombat: (minion: BoardEntity, input: SoCInput) => {
		const candidateBoard = input.playerBoard.filter((e) => !isGolden(e.cardId, input.gameState.allCards));
		// Because we pick one at random from all the ones that have the lowest tier
		const randomBoard = shuffleArray(candidateBoard);
		const candidates = randomBoard.sort(
			(a, b) =>
				input.gameState.cardsData.getTavernLevel(a.cardId) - input.gameState.cardsData.getTavernLevel(b.cardId),
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
		return { hasTriggered: true, shouldRecomputeCurrentAttacker: false };
	},
};
