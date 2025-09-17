import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const MoonsteelJuggernaut: EndOfTurnCard = {
	cardIds: [CardIds.MoonsteelJuggernaut_BG31_171, CardIds.MoonsteelJuggernaut_BG31_171_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const buff = minion.cardId === CardIds.MoonsteelJuggernaut_BG31_171_G ? 2 : 1;
		const cards =
			minion.cardId === CardIds.MoonsteelJuggernaut_BG31_171_G
				? [
						CardIds.MoonsteelJuggernaut_MoonsteelSatelliteToken_BG31_171t,
						CardIds.MoonsteelJuggernaut_MoonsteelSatelliteToken_BG31_171t,
				  ]
				: [CardIds.MoonsteelJuggernaut_MoonsteelSatelliteToken_BG31_171t];
		addCardsInHand(input.hero, input.board, cards, input.gameState);
	},
};
