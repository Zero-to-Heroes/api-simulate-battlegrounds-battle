import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { AvengeCard } from '../../card.interface';

export const CupcakePeddler: AvengeCard = {
	cardIds: [CardIds.CupcakePeddler_BG33_153, CardIds.CupcakePeddler_BG33_153_G],
	baseAvengeValue: (cardId: string) => 4,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const mult = minion.cardId === CardIds.CupcakePeddler_BG33_153_G ? 2 : 1;
		const cardToAdd = Array(mult).fill(CardIds.CorruptedCupcakes_BG28_607);
		addCardsInHand(input.hero, input.board, cardToAdd, input.gameState);
	},
};
