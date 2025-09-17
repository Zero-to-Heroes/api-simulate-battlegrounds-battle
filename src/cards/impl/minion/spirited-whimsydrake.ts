import { CardIds } from '../../../services/card-ids';
import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { BattlecryInput } from '../../../simulation/battlecries';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { BattlecryCard } from '../../card.interface';

export const SpiritedWhimsydrake: BattlecryCard = {
	cardIds: [CardIds.SpiritedWhimsydrake_BG32_823, CardIds.SpiritedWhimsydrake_BG32_823_G],
	battlecry: (minion: BoardEntity, input: BattlecryInput) => {
		const mult = minion.cardId === CardIds.SpiritedWhimsydrake_BG32_823_G ? 2 : 1;
		const cardsToAdd = [];
		for (let i = 0; i < mult; i++) {
			cardsToAdd.push(input.gameState.cardsData.getRandomMinionForTribe(Race.DRAGON, input.hero.tavernTier ?? 1));
		}
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
		return true;
	},
};
