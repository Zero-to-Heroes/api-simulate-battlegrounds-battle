import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { BattlecryCard } from '../../card.interface';

export const HuntingTigerShark: BattlecryCard = {
	cardIds: [TempCardIds.HuntingTigerShark, TempCardIds.HuntingTigerShark_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === TempCardIds.HuntingTigerShark_G ? 2 : 1;
		for (let i = 0; i < mult; i++) {
			const beast = input.gameState.cardsData.getRandomMinionForTribe(Race.BEAST, input.hero.tavernTier ?? 4);
			addCardsInHand(input.hero, input.board, [beast], input.gameState);
		}
		return true;
	},
};
