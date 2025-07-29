import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { AfterDealDamageInput } from '../../../simulation/damage-effects';
import { modifyStats } from '../../../simulation/stats';
import { TempCardIds } from '../../../temp-card-ids';
import { hasCorrectTribe } from '../../../utils';
import { AfterDealDamageCard } from '../../card.interface';

export const StraySatyr: AfterDealDamageCard = {
	cardIds: [TempCardIds.StraySatyr, TempCardIds.StraySatyr_G],
	afterDealDamage: (minion: BoardEntity, input: AfterDealDamageInput) => {
		const mult = minion.cardId === TempCardIds.StraySatyr_G ? 2 : 1;
		if (
			hasCorrectTribe(
				input.damageDealer,
				input.hero,
				Race.DEMON,
				input.gameState.anomalies,
				input.gameState.allCards,
			)
		) {
			modifyStats(minion, minion, 2 * mult, 0, input.board, input.hero, input.gameState);
		}
	},
};
