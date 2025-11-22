import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { AvengeCard } from '../../card.interface';

export const TimewarpedGeomancer: AvengeCard = {
	cardIds: [TempCardIds.TimewarpedGeomancer, TempCardIds.TimewarpedGeomancer_G],
	baseAvengeValue: (cardId: string) => 2,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const mult = minion.cardId === TempCardIds.TimewarpedGeomancer_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.BloodGem);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
