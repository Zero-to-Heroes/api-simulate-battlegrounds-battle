import { CardIds, Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { AfterDealDamageInput } from '../../../simulation/damage-effects';
import { modifyStats } from '../../../simulation/stats';
import { hasCorrectTribe } from '../../../utils';
import { AfterDealDamageCard } from '../../card.interface';

export const DevoutHellcaller: AfterDealDamageCard = {
	cardIds: [CardIds.DevoutHellcaller_BG33_155, CardIds.DevoutHellcaller_BG33_155_G],
	afterDealDamage: (minion: BoardEntity, input: AfterDealDamageInput) => {
		const mult = minion.cardId === CardIds.DevoutHellcaller_BG33_155_G ? 2 : 1;
		if (
			input.damageDealer != minion &&
			hasCorrectTribe(
				input.damageDealer,
				input.hero,
				Race.DEMON,
				input.gameState.anomalies,
				input.gameState.allCards,
			)
		) {
			modifyStats(minion, minion, 1 * mult, 1 * mult, input.board, input.hero, input.gameState);
		}
	},
};
