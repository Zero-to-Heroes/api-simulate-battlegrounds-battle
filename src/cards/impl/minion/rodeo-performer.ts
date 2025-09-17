import { CardIds } from '../../../services/card-ids';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { BattlecryCard } from '../../card.interface';

export const RodeoPerformer: BattlecryCard = {
	cardIds: [CardIds.RodeoPerformer_BG28_550, CardIds.RodeoPerformer_BG28_550_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const rodeoPerformerCardsToAdd = minion.cardId === CardIds.RodeoPerformer_BG28_550_G ? [null] : [null, null];
		addCardsInHand(input.hero, input.board, rodeoPerformerCardsToAdd, input.gameState);
		return true;
	},
};
