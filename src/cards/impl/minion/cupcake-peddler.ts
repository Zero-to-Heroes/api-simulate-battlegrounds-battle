import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { AvengeCard } from '../../card.interface';

export const CupcakePeddler: AvengeCard = {
	cardIds: [TempCardIds.CupcakePeddler, TempCardIds.CupcakePeddler_G],
	baseAvengeValue: (cardId: string) => 4,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const mult = minion.cardId === TempCardIds.CupcakePeddler_G ? 2 : 1;
		const cardToAdd = Array(mult).fill(CardIds.CorruptedCupcakes_BG28_607);
		addCardsInHand(input.hero, input.board, cardToAdd, input.gameState);
	},
};
