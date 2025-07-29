import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { AfterDealDamageInput } from '../../../simulation/damage-effects';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { hasCorrectTribe } from '../../../utils';
import { AfterDealDamageCard } from '../../card.interface';

export const DevoutHellcaller: AfterDealDamageCard = {
	cardIds: [TempCardIds.DevoutHellcaller, TempCardIds.DevoutHellcaller_G],
	afterDealDamage: (minion: BoardEntity, input: AfterDealDamageInput) => {
		const mult = minion.cardId === TempCardIds.DevoutHellcaller_G ? 2 : 1;
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
