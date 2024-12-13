import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnCardAddedToHandInput } from '../../../simulation/cards-in-hand';
import { modifyStats } from '../../../simulation/stats';
import { DefaultChargesCard, OnCardAddedToHandCard } from '../../card.interface';

export const SaltyHog: OnCardAddedToHandCard & DefaultChargesCard = {
	cardIds: [CardIds.SaltyHog_BG31_332, CardIds.SaltyHog_BG31_332_G],
	defaultCharges: (entity: BoardEntity) => entity.scriptDataNum1 || 3,
	onCardAddedToHand: (entity: BoardEntity, input: OnCardAddedToHandInput) => {
		entity.abiityChargesLeft = entity.abiityChargesLeft - 1;
		if (entity.abiityChargesLeft <= 0) {
			const mult = entity.cardId === CardIds.SaltyHog_BG31_332_G ? 2 : 1;
			const targets = input.board.filter((e) => e.entityId !== entity.entityId);
			for (const target of targets) {
				modifyStats(target, 2 * mult, 2 * mult, input.board, input.hero, input.gameState);
			}
			entity.abiityChargesLeft = 3;
		}
	},
};
