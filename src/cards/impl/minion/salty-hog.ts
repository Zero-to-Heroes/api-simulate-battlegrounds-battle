import { BoardEntity } from '../../../board-entity';
import { OnCardAddedToHandInput } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { addStatsToBoard } from '../../../utils';
import { DefaultChargesCard, OnCardAddedToHandCard } from '../../card.interface';

export const SaltyHog: OnCardAddedToHandCard & DefaultChargesCard = {
	cardIds: [TempCardIds.SaltyHog, TempCardIds.SaltyHog_G],
	defaultCharges: 3,
	onCardAddedToHand: (entity: BoardEntity, input: OnCardAddedToHandInput) => {
		entity.abiityChargesLeft = entity.abiityChargesLeft - 1;
		if (entity.abiityChargesLeft <= 0) {
			const mult = entity.cardId === TempCardIds.SaltyHog_G ? 2 : 1;
			addStatsToBoard(
				entity,
				input.board.filter((e) => e.entityId !== entity.entityId),
				input.hero,
				2 * mult,
				2 * mult,
				input.gameState,
			);
			entity.abiityChargesLeft = SaltyHog.defaultCharges;
		}
	},
};
