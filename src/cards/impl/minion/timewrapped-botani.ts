import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const TimewrappedBotani: EndOfTurnCard = {
	cardIds: [TempCardIds.TimewrappedBotani, TempCardIds.TimewrappedBotani_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === TempCardIds.TimewrappedBotani_G ? 2 : 1;
		const cardsToAdd = [];
		for (let i = 0; i < mult; i++) {
			cardsToAdd.push(input.gameState.cardsData.getRandomMinionForTavernTier(input.hero.tavernTier ?? 3));
		}
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
