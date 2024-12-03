import { CardIds } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { BattlecryCard } from '../../card.interface';

export const GrittyHeadhunter: BattlecryCard = {
	cardIds: [CardIds.GrittyHeadhunter_BG31_822, CardIds.GrittyHeadhunter_BG31_822_G],
	battlecry: (entity: BoardEntity, input: BattlecryInput) => {
		const cards =
			entity.cardId === CardIds.GrittyHeadhunter_BG31_822_G
				? [CardIds.MaraudersContract_BG31_891, CardIds.MaraudersContract_BG31_891]
				: [CardIds.MaraudersContract_BG31_891];
		addCardsInHand(input.hero, input.board, cards, input.gameState);
	},
};
