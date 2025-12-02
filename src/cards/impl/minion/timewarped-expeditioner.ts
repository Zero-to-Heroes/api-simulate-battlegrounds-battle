import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { modifyStats, OnStatsChangedInput } from '../../../simulation/stats';
import { OnStatsChangedCard } from '../../card.interface';

export const TimewarpedExpeditioner: OnStatsChangedCard = {
	cardIds: [CardIds.TimewarpedExpeditioner_BG34_Giant_317, CardIds.TimewarpedExpeditioner_BG34_Giant_317_G],
	onStatsChanged: (minion: BoardEntity, input: OnStatsChangedInput) => {
		const mult = minion.cardId === CardIds.TimewarpedExpeditioner_BG34_Giant_317_G ? 2 : 1;
		if ((input.attackAmount > 0 || input.healthAmount > 0) && input.target === minion) {
			const minionsInHand = input.hero.hand.filter((c) => !!c?.maxHealth);
			if (minionsInHand.length > 0) {
				const target = minionsInHand[0];
				modifyStats(
					target,
					minion,
					input.attackAmount * mult,
					input.healthAmount * mult,
					input.board,
					input.hero,
					input.gameState,
				);
			}
			if (minionsInHand.length > 1) {
				const target = minionsInHand[1];
				modifyStats(
					target,
					minion,
					input.attackAmount * mult,
					input.healthAmount * mult,
					input.board,
					input.hero,
					input.gameState,
				);
			}
		}
	},
};
