import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { OnCardAddedToHandInput } from '../../../simulation/cards-in-hand';
import { addStatsToBoard } from '../../../utils';
import { DefaultChargesCard, OnCardAddedToHandCard } from '../../card.interface';

export const SaltyHog: OnCardAddedToHandCard & DefaultChargesCard = {
	cardIds: [CardIds.SaltyHog_BG31_332, CardIds.SaltyHog_BG31_332_G],
	defaultCharges: (cardId: string) => 3,
	onCardAddedToHand: (entity: BoardEntity, input: OnCardAddedToHandInput) => {
		entity.abiityChargesLeft = entity.abiityChargesLeft - 1;
		if (entity.abiityChargesLeft <= 0) {
			const mult = entity.cardId === CardIds.SaltyHog_BG31_332_G ? 2 : 1;
			addStatsToBoard(
				entity,
				input.board.filter((e) => e.entityId !== entity.entityId),
				input.hero,
				2 * mult,
				2 * mult,
				input.gameState,
			);
			entity.abiityChargesLeft = SaltyHog.defaultCharges(entity.cardId);
		}
	},
};
