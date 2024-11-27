import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const FairyGillmother: EndOfTurnCard = {
	cardIds: [TempCardIds.FairyGillmother, TempCardIds.FairyGillmother_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const numberOfCards = minion.cardId === TempCardIds.FairyGillmother_G ? 2 : 1;
		const cards = [];
		for (let i = 0; i < numberOfCards; i++) {
			const card = input.gameState.cardsData.getRandomMinionForTribe(Race.MURLOC, input.hero.tavernTier);
			cards.push(card);
		}
		addCardsInHand(input.hero, input.board, cards, input.gameState);
	},
};
