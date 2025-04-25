import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { AvengeCard } from '../../card.interface';

export const DrustfallenButcher: AvengeCard = {
	cardIds: [CardIds.DrustfallenButcher_BG32_324, CardIds.DrustfallenButcher_BG32_324_G],
	baseAvengeValue: (cardId: string) => 5,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const mult = minion.cardId === CardIds.DrustfallenButcher_BG32_324_G ? 2 : 1;
		const cardsToAdd = Array(mult).fill(CardIds.Butchering_BG28_604);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
