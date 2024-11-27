import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const MoonsteelJuggernaut: EndOfTurnCard = {
	cardIds: [TempCardIds.MoonsteelJuggernaut, TempCardIds.MoonsteelJuggernaut_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const buff = minion.cardId === TempCardIds.MoonsteelJuggernaut_G ? 2 : 1;
		const cards =
			minion.cardId === TempCardIds.MoonsteelJuggernaut_G
				? [TempCardIds.Satellite, TempCardIds.Satellite]
				: [TempCardIds.Satellite];
		addCardsInHand(input.hero, input.board, cards, input.gameState);
	},
};
