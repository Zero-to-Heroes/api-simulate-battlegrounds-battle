import { CardIds, CardType } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnStatsChangedInput } from '../../../simulation/stats';
import { OnStatsChangedCard } from '../../card.interface';

export const MurkbrineExpeditioner: OnStatsChangedCard = {
	cardIds: [CardIds.MurkbrineExpeditioner_BG32_335, CardIds.MurkbrineExpeditioner_BG32_335_G],
	onStatsChanged: (minion: BoardEntity, input: OnStatsChangedInput) => {
		if (input.target !== minion || input.attackAmount < 0 || input.healthAmount < 0) {
			return;
		}

		const target = input.hero.hand.filter(
			(c) => input.gameState.allCards.getCard(c.cardId).type?.toUpperCase() === CardType[CardType.MINION],
		)[0];
		if (target) {
			target.attack += input.attackAmount;
			target.health += input.healthAmount;
		}
	},
};
