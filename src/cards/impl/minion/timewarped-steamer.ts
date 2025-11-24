import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const TimewarpedSteamer: EndOfTurnCard = {
	cardIds: [TempCardIds.TimewarpedSteamer, TempCardIds.TimewarpedSteamer_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedSteamer_G ? 2 : 1;
		const cardsToAdd = Array(2 * mult).map(() =>
			input.gameState.cardsData.getRandomMechToMagnetize(input.hero.tavernTier ?? 5),
		);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
