import { CardIds } from '../../../services/card-ids';
import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnAfterDeathInput } from '../../../simulation/attack';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { OnAfterDeathCard } from '../../card.interface';

export const HungrySnapjaw: OnAfterDeathCard = {
	cardIds: [CardIds.HungrySnapjaw_BG26_370, CardIds.HungrySnapjaw_BG26_370_G],
	onAfterDeath: (minion: BoardEntity, input: OnAfterDeathInput) => {
		const mult = minion.cardId === CardIds.HungrySnapjaw_BG26_370_G ? 2 : 1;
		for (const deadEntity of input.deadEntities) {
			if (
				hasCorrectTribe(deadEntity, input.hero, Race.BEAST, input.gameState.anomalies, input.gameState.allCards)
			) {
				modifyStats(minion, minion, 0, 1 * mult, input.board, input.hero, input.gameState);
			}
		}
	},
};
