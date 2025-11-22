import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnAfterDeathInput } from '../../../simulation/attack';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { hasCorrectTribe } from '../../../utils';
import { OnAfterDeathCard } from '../../card.interface';

export const TimewarpedHyena: OnAfterDeathCard = {
	cardIds: [TempCardIds.TimewarpedHyena, TempCardIds.TimewarpedHyena_G],
	onAfterDeath: (minion: BoardEntity, input: OnAfterDeathInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedHyena_G ? 2 : 1;
		for (const deadEntity of input.deadEntities) {
			if (
				hasCorrectTribe(deadEntity, input.hero, Race.BEAST, input.gameState.anomalies, input.gameState.allCards)
			) {
				modifyStats(minion, minion, 2 * mult, 1 * mult, input.board, input.hero, input.gameState);
			}
		}
	},
};
