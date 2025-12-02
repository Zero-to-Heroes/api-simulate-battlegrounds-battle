import { BoardEntity } from '../../../board-entity';
import { CardIds } from '../../../services/card-ids';
import { AvengeInput } from '../../../simulation/avenge';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { AvengeCard } from '../../card.interface';

export const SpiritDrake: AvengeCard = {
	cardIds: [CardIds.SpiritDrake_BG34_520, CardIds.SpiritDrake_BG34_520_G],
	baseAvengeValue: (cardId: string) => 3,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const mult = minion.cardId === CardIds.SpiritDrake_BG34_520_G ? 2 : 1;
		const cardsToAdd = [];
		for (let i = 0; i < mult; i++) {
			cardsToAdd.push(input.gameState.cardsData.getRandomTavernSpell());
		}
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
