import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const TimewarpedBotani: EndOfTurnCard = {
	cardIds: [CardIds.TimewarpedBotani_BG34_Giant_594, CardIds.TimewarpedBotani_BG34_Giant_594_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.TimewarpedBotani_BG34_Giant_594_G ? 2 : 1;
		const cardsToAdd = [];
		for (let i = 0; i < mult; i++) {
			cardsToAdd.push(input.gameState.cardsData.getRandomMinionForTavernTier(input.hero.tavernTier ?? 3));
		}
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
