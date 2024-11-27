import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { BattlecryCard } from '../../card.interface';

export const GeneralDrakkisath: BattlecryCard = {
	cardIds: [CardIds.GeneralDrakkisath_BG25_309, CardIds.GeneralDrakkisath_BG25_309_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const generalDrakkisathCardsToAdd =
			minion.cardId === CardIds.GeneralDrakkisath_BG25_309
				? [CardIds.GeneralDrakkisath_SmolderwingToken_BG25_309t]
				: [
						CardIds.GeneralDrakkisath_SmolderwingToken_BG25_309t,
						CardIds.GeneralDrakkisath_SmolderwingToken_BG25_309t,
				  ];
		addCardsInHand(input.hero, input.board, generalDrakkisathCardsToAdd, input.gameState);
	},
};
