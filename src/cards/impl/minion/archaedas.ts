import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { BattlecryCard } from '../../card.interface';

export const Archaedas: BattlecryCard = {
	cardIds: [TempCardIds.Archaedas, TempCardIds.Archaedas_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === TempCardIds.Archaedas_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			const minionToAdd = input.gameState.cardsData.getRandomMinionForTavernTier(5);
			if (!!minionToAdd) {
				addCardsInHand(input.hero, input.board, [minionToAdd], input.gameState);
			}
		}
		return true;
	},
};
