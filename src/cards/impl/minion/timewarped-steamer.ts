import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { EndOfTurnCard, EndOfTurnInput } from '../../card.interface';

export const TimewarpedSteamer: EndOfTurnCard = {
	cardIds: [CardIds.TimewarpedSteamer_BG34_PreMadeChamp_038, CardIds.TimewarpedSteamer_BG34_PreMadeChamp_038_G],
	endOfTurn: (minion: BoardEntity, input: EndOfTurnInput) => {
		const mult = minion.cardId === CardIds.TimewarpedSteamer_BG34_PreMadeChamp_038_G ? 2 : 1;
		const cardsToAdd = [
			CardIds.AutoAccelerator_BlueVolumizerToken_BG34_170t2,
			CardIds.AutoAccelerator_GreenVolumizerToken_BG34_170t3,
			CardIds.AutoAccelerator_RedVolumizerToken_BG34_170t,
		];
		for (let i = 0; i < mult; i++) {
			addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
		}
	},
};
