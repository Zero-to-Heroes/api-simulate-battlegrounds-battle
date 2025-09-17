import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { EndOfTurnCard } from '../../card.interface';

export const OutbackSmolderer: EndOfTurnCard = {
	cardIds: [CardIds.OutbackSmolderer_BG28_592, CardIds.OutbackSmolderer_BG28_592_G],
	endOfTurn: (minion: BoardEntity, input: BattlecryInput) => {
		const cards =
			minion.cardId === CardIds.OutbackSmolderer_BG28_592_G
				? [
						CardIds.GeneralDrakkisath_SmolderwingToken_BG25_309t,
						CardIds.GeneralDrakkisath_SmolderwingToken_BG25_309t,
				  ]
				: [CardIds.GeneralDrakkisath_SmolderwingToken_BG25_309t];
		addCardsInHand(input.hero, input.board, cards, input.gameState);
	},
};
