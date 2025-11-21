import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { AvengeCard } from '../../card.interface';

export const SpiritDrake: AvengeCard = {
	cardIds: [TempCardIds.SpiritDrake, TempCardIds.SpiritDrake_G],
	baseAvengeValue: (cardId: string) => 3,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const mult = minion.cardId === TempCardIds.SpiritDrake_G ? 2 : 1;
		const cardsToAdd = [];
		for (let i = 0; i < mult; i++) {
			cardsToAdd.push(input.gameState.cardsData.getRandomTavernSpell());
		}
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
