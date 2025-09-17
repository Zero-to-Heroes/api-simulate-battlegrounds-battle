import { CardIds } from '../../../services/card-ids';
import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const FairyGillmother: EndOfTurnCard = {
	cardIds: [CardIds.FairyGillmother_BG29_029, CardIds.FairyGillmother_BG29_029_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const numberOfCards = minion.cardId === CardIds.FairyGillmother_BG29_029_G ? 2 : 1;
		const cards = [];
		for (let i = 0; i < numberOfCards; i++) {
			const card = input.gameState.cardsData.getRandomMinionForTribe(Race.MURLOC, input.hero.tavernTier);
			cards.push(card);
		}
		addCardsInHand(input.hero, input.board, cards, input.gameState);
	},
};
