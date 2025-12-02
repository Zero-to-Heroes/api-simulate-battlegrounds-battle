import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { AvengeInput } from '../../../simulation/avenge';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { AvengeCard } from '../../card.interface';

export const TimewarpedGeomancer: AvengeCard = {
	cardIds: [CardIds.TimewarpedGeomancer_BG34_Giant_305, CardIds.TimewarpedGeomancer_BG34_Giant_305_G],
	baseAvengeValue: (cardId: string) => 2,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const mult = minion.cardId === CardIds.TimewarpedGeomancer_BG34_Giant_305_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.BloodGem);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
