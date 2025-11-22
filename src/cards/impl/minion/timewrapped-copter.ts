import { Race } from '@firestone-hs/reference-data';
import { BoardEntity } from '../../../board-entity';
import { AvengeInput } from '../../../simulation/avenge';
import { addCardsInHand } from '../../../simulation/cards-in-hand';
import { TempCardIds } from '../../../temp-card-ids';
import { AvengeCard } from '../../card.interface';

export const TimewrappedCopter: AvengeCard = {
	cardIds: [TempCardIds.TimewrappedCopter, TempCardIds.TimewrappedCopter_G],
	baseAvengeValue: (cardId: string) => 3,
	avenge: (minion: BoardEntity, input: AvengeInput) => {
		const mult = minion.cardId === TempCardIds.TimewrappedCopter_G ? 2 : 1;
		const cardsToAdd = [];
		for (let i = 0; i < mult; i++) {
			const cardToAdd = input.gameState.cardsData.getRandomMinionForTribe(Race.MECH, input.hero.tavernTier ?? 3);
			if (cardToAdd) {
				cardsToAdd.push(cardToAdd);
			}
		}
		addCardsInHand(input.hero, input.board, cardsToAdd, input.gameState);
	},
};
