import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { AfterTavernSpellCastCard, CastSpellInput, DefaultChargesCard } from '../../card.interface';

export const TimewarpedCenturion: AfterTavernSpellCastCard & DefaultChargesCard = {
	cardIds: [TempCardIds.TimewarpedCenturion, TempCardIds.TimewarpedCenturion_G],
	defaultCharges: (entity: BoardEntity) => 2,
	afterTavernSpellCast: (entity: BoardEntity, input: CastSpellInput) => {
		if (entity.abiityChargesLeft <= 0) {
			return;
		}
		entity.abiityChargesLeft--;
		const mult = entity.cardId === TempCardIds.TimewarpedCenturion_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(input.spellCardId);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
