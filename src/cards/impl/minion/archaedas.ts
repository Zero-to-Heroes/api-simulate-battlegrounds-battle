import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { BattlecryCard } from '../../card.interface';

export const Archaedas: BattlecryCard = {
	cardIds: [CardIds.Archaedas_BG34_651, CardIds.Archaedas_BG34_651_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === CardIds.Archaedas_BG34_651_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			const minionToAdd = input.gameState.cardsData.getRandomMinionForTavernTier(5);
			if (!!minionToAdd) {
				addCardsInHand(input.hero, input.board, [minionToAdd], input.gameState);
			}
		}
		return true;
	},
};
