import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { playBloodGemsOn } from '../../../simulation/blood-gems';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const BongoBopper: EndOfTurnCard = {
	cardIds: [CardIds.BongoBopper_BG26_531, CardIds.BongoBopper_BG26_531_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.BongoBopper_BG26_531 ? 1 : 2;
		playBloodGemsOn(minion, minion, 2 * mult, input.board, input.hero, input.gameState);
		const cardsToAdd = Array(2 * mult).fill(CardIds.BloodGem);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
