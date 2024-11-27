import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { BattlecryCard } from '../../card.interface';

export const GrittyHeadhunter: BattlecryCard = {
	cardIds: [TempCardIds.GrittyHeadhunter, TempCardIds.GrittyHeadhunter_G],
	battlecry: (entity: BoardEntity, input: BattlecryInput) => {
		const cards =
			entity.cardId === TempCardIds.GrittyHeadhunter_G
				? [TempCardIds.MaraudersContract, TempCardIds.MaraudersContract]
				: [TempCardIds.MaraudersContract];
		addCardsInHand(input.hero, input.board, cards, input.gameState);
	},
};
