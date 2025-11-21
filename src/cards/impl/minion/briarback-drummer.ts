import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { BattlecryCard } from '../../card.interface';

export const BriarbackDrummer: BattlecryCard = {
	cardIds: [TempCardIds.BriarbackDrummer, TempCardIds.BriarbackDrummer_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === TempCardIds.BriarbackDrummer_G ? 2 : 4;
		const cardsToAdd = Array(mult).fill(TempCardIds.BloodGemBarrage);
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
		return true;
	},
};
