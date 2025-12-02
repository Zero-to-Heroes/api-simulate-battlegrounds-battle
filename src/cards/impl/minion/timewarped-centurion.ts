import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { AfterTavernSpellCastCard, CastSpellInput, DefaultChargesCard } from '../../card.interface';

export const TimewarpedCenturion: AfterTavernSpellCastCard & DefaultChargesCard = {
	cardIds: [CardIds.TimewarpedCenturion_BG34_PreMadeChamp_200, CardIds.TimewarpedCenturion_BG34_PreMadeChamp_200_G],
	defaultCharges: (entity: BoardEntity) => 2,
	afterTavernSpellCast: (entity: BoardEntity, input: CastSpellInput) => {
		if (entity.abiityChargesLeft <= 0) {
			return;
		}
		entity.abiityChargesLeft--;
		const mult = entity.cardId === CardIds.TimewarpedCenturion_BG34_PreMadeChamp_200_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(input.spellCardId);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
